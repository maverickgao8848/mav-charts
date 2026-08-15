import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C11 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") browserProblems.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C11&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C11"]');
      await expect(chart).toBeVisible();
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C11"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`C11-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=C11&theme=signal&capture");
  await expect(page.locator('[data-chart-id="C11"]').getByRole("table", { name: "Before and after values" })).toContainText("North");

  await page.setViewportSize(layouts.mobile);
  await page.goto("/?template=C11&theme=signal&capture");
  const mobileChart = page.locator('[data-chart-id="C11"]');
  const legendBox = await mobileChart.getByRole("list", { name: "Legend" }).boundingBox();
  const firstMarkBox = await mobileChart.locator('[role="graphics-symbol"]').first().boundingBox();
  expect(legendBox).not.toBeNull();
  expect(firstMarkBox).not.toBeNull();
  expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((firstMarkBox?.y ?? 0) + 1);
  await page.goto("/?template=C11&theme=editorial&case=long-label&capture");
  await expect(page.locator('[data-chart-id="C11"]')).toHaveScreenshot("C11-long-label-mobile.png", { animations: "disabled" });
  await page.goto("/?template=C11&theme=digital&case=missing&capture");
  await expect(page.locator('[data-chart-id="C11"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C11&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="C11"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`C11-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
