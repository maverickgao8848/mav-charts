import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("B03 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=B03&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="B03"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      const interactive = chart.getByRole("group", { name: "Dual axis interactive chart" });
      await expect(interactive).toHaveAttribute("data-animation-enabled", "false");
      await expect(interactive).toHaveAttribute("data-bar-animation", "false");
      await expect(interactive).toHaveAttribute("data-line-animation", "false");
      await expect(chart.locator('.recharts-bar-rectangle')).toHaveCount(6);
      await expect(chart.locator('.recharts-line-curve')).toBeVisible();
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="B03"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      if (layout === "mobile" && system === "signal") {
        const legendBox = await chart.getByRole("list", { name: "Series legend with independent units" }).boundingBox();
        const directBox = await chart.getByLabel("Direct series values").boundingBox();
        expect(legendBox).not.toBeNull();
        expect(directBox).not.toBeNull();
        expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual(directBox?.y ?? 0);
      }
      await expect(chart).toHaveScreenshot(`B03-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto("/?template=B03&theme=signal&capture");
  const interactionChart = page.locator('[data-chart-id="B03"]');
  await interactionChart.locator(".recharts-bar-rectangle").first().hover();
  await expect(interactionChart.getByText("Revenue: 38 $M", { exact: true })).toBeVisible();
  await expect(interactionChart.getByText("Margin: 29 %", { exact: true })).toBeVisible();
  await expect(interactionChart.getByRole("table", { name: "Independent dual-axis series" })).toContainText("Jan");
  await page.goto("/?template=B03&theme=editorial");
  const animated = page.getByRole("group", { name: "Dual axis interactive chart" });
  await expect(animated).toHaveAttribute("data-bar-animation", "true");
  await expect(animated).toHaveAttribute("data-line-animation", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=B03&theme=editorial");
  const reduced = page.getByRole("group", { name: "Dual axis interactive chart" });
  await expect(reduced).toHaveAttribute("data-bar-animation", "false");
  await expect(reduced).toHaveAttribute("data-line-animation", "false");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["missing-bar", "missing-line", "negative", "extreme", "long-label", "flat"]) {
    await page.goto(`/?template=B03&theme=${edgeCase === "negative" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital"}&case=${edgeCase}&capture`);
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await expect(page.locator('[data-chart-id="B03"]')).toHaveScreenshot(`B03-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  for (const invalidCase of ["invalid", "nonfinite"]) {
    await page.goto(`/?template=B03&theme=digital&case=${invalidCase}&capture`);
    await expect(page.locator('[data-chart-id="B03"]')).toHaveAttribute("data-state", "invalid");
  }

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=B03&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="B03"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`B03-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
