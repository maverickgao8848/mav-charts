import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C02 renders controlled rounded columns across systems and layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C02&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C02"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Rounded columns interactive chart" })).toHaveAttribute("data-rounded-animation", "false");
      await expect(chart.locator("[data-rounded-column]")).toHaveCount(3);
      const radii = await chart.locator("[data-rounded-column]").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-controlled-radius"))));
      expect(radii.every((radius) => radius >= 0 && radius <= 18)).toBe(true);
      if (system === "signal") {
        await expect(chart.locator('[data-column-focus="true"] path')).toHaveAttribute("fill", "#ff0000");
        await expect(chart.locator('[data-column-focus="false"] path')).toHaveCount(2);
        for (const path of await chart.locator('[data-column-focus="false"] path').all()) await expect(path).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C02"]').analyze();
        expect(accessibility.violations, `${system} must pass browser axe including color contrast`).toEqual([]);
      }
      if (layout === "mobile") {
        const legendBox = await chart.locator("[data-rounded-legend]").boundingBox();
        const plotBox = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(legendBox).not.toBeNull();
        expect(plotBox).not.toBeNull();
        expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
      }
      await expect(chart).toHaveScreenshot(`C02-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto("/?template=C02&theme=signal&capture");
  const interactionChart = page.locator('[data-chart-id="C02"]');
  await interactionChart.locator('[data-rounded-column="Momentum"] path').hover();
  await expect(interactionChart.getByText("Score: 84", { exact: true })).toBeVisible();
  await expect(interactionChart.locator("small").filter({ hasText: "Current focus" })).toBeVisible();
  await expect(interactionChart.getByRole("table", { name: "Rounded column values" })).toContainText("Momentum");
  await page.goto("/?template=C02&theme=signal");
  await expect(page.getByRole("group", { name: "Rounded columns interactive chart" })).toHaveAttribute("data-rounded-animation", "true");
  await expect(page.locator('[data-chart-id="C02"] [data-mav-entry="rounded-column"]')).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C02&theme=signal");
  await expect(page.getByRole("group", { name: "Rounded columns interactive chart" })).toHaveAttribute("data-rounded-animation", "false");
  await expect(page.locator('[data-chart-id="C02"] [data-mav-entry="rounded-column"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["empty", "single", "missing", "negative", "small-zero", "extreme", "long-label"] as const) {
    const theme = edgeCase === "negative" || edgeCase === "small-zero" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital";
    await page.goto(`/?template=C02&theme=${theme}&case=${edgeCase}&capture`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[data-chart-id="C02"]')).toHaveScreenshot(`C02-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C02&theme=digital&case=invalid&capture");
  await expect(page.locator('[data-chart-id="C02"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C02&theme=${system}&capture`);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C02"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`C02-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
