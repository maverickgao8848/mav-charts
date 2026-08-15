import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C01 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C01&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C01"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Simple columns interactive chart" })).toHaveAttribute("data-column-animation", "false");
      await expect(chart.locator('[data-column-bar]')).toHaveCount(5);
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C01"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      if (layout === "wide" && system === "signal") {
        await expect(chart.locator('[data-column-focus="true"]')).toHaveCount(1);
        await expect(chart.locator('[data-column-focus="false"]')).toHaveCount(4);
        await expect(chart.getByRole("list", { name: "Column legend" })).toContainText("Focus");
      }
      await expect(chart).toHaveScreenshot(`C01-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto("/?template=C01&theme=signal&capture");
  const interactionChart = page.locator('[data-chart-id="C01"]');
  await interactionChart.locator('[data-column-bar="North"] rect').hover();
  await expect(interactionChart.getByText("Value: 72", { exact: true })).toBeVisible();
  await expect(interactionChart.locator("small").filter({ hasText: "Largest region" })).toBeVisible();
  await expect(interactionChart.getByRole("table", { name: "Simple column values" })).toContainText("North");
  await page.goto("/?template=C01&theme=signal");
  const animated = page.getByRole("group", { name: "Simple columns interactive chart" });
  await expect(animated).toHaveAttribute("data-column-animation", "true");
  await expect(page.locator('[data-chart-id="C01"] [data-mav-entry="simple-column"]')).toHaveCount(5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C01&theme=signal");
  const reduced = page.getByRole("group", { name: "Simple columns interactive chart" });
  await expect(reduced).toHaveAttribute("data-column-animation", "false");
  await expect(page.locator('[data-chart-id="C01"] [data-mav-entry="simple-column"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["missing", "negative", "extreme", "long-label"]) {
    await page.goto(`/?template=C01&theme=${edgeCase === "negative" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital"}&case=${edgeCase}&capture`);
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await expect(page.locator('[data-chart-id="C01"]')).toHaveScreenshot(`C01-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C01&theme=signal&capture");
  const mobileChart = page.locator('[data-chart-id="C01"]');
  const legendBox = await mobileChart.getByRole("list", { name: "Column legend" }).boundingBox();
  const plotBox = await mobileChart.locator(".recharts-cartesian-grid").boundingBox();
  expect(legendBox).not.toBeNull();
  expect(plotBox).not.toBeNull();
  expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
  await page.goto("/?template=C01&theme=digital&case=invalid&capture");
  await expect(page.locator('[data-chart-id="C01"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C01&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="C01"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`C01-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
