import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

test("C10 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") browserProblems.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C10&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C10"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C10"]').analyze();
        expect(accessibility.violations, `${system} must pass browser axe including color contrast`).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`C10-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=C10&theme=signal&capture");
  await expect(page.locator('[data-chart-id="C10"]').getByRole("table", { name: "Profit bridge values" })).toContainText("Base");

  await page.setViewportSize(layouts.mobile);
  await page.goto("/?template=C10&theme=signal&capture");
  const mobileChart = page.locator('[data-chart-id="C10"]');
  const legendBox = await mobileChart.getByRole("list", { name: "Legend" }).boundingBox();
  const plotBox = await mobileChart.locator(".recharts-cartesian-grid").boundingBox();
  expect(legendBox).not.toBeNull();
  expect(plotBox).not.toBeNull();
  expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
  await page.goto("/?template=C10&theme=signal&case=long-label&capture");
  await expect(page.locator('[data-chart-id="C10"]')).toHaveScreenshot("C10-long-label-mobile.png", { animations: "disabled" });

  await page.goto("/?template=C10&theme=digital&case=missing&capture");
  await expect(page.locator('[data-chart-id="C10"]')).toHaveAttribute("data-state", "invalid");
  await expect(page.locator('[data-chart-id="C10"]')).toHaveScreenshot("C10-missing-mobile.png", { animations: "disabled" });

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C10&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="C10"]');
    await chart.evaluate((element) => {
      element.style.transform = "scale(.25)";
      element.style.transformOrigin = "top left";
    });
    await expect(chart).toHaveScreenshot(`C10-${system}-thumbnail.png`, { animations: "disabled" });
  }

  expect(browserProblems).toEqual([]);
});
