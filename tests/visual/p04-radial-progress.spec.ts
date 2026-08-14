import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("P04 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=P04&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="P04"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Radial progress interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator('.recharts-radial-bar-sector')).toHaveCount(3);
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="P04"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`P04-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.mobile);
  await page.goto("/?template=P04&theme=signal&capture");
  const mobileChart = page.locator('[data-chart-id="P04"]');
  const legendBox = await mobileChart.getByRole("list", { name: "Legend" }).boundingBox();
  const directBox = await mobileChart.getByLabel("Direct percentage labels").boundingBox();
  expect(legendBox).not.toBeNull();
  expect(directBox).not.toBeNull();
  expect((legendBox?.x ?? 0) + (legendBox?.width ?? 0)).toBeLessThanOrEqual((directBox?.x ?? 0) + 1);
  await page.goto("/?template=P04&theme=editorial&case=long-label&capture");
  await expect(page.locator('[data-chart-id="P04"]')).toHaveScreenshot("P04-long-label-mobile.png", { animations: "disabled" });
  for (const invalidCase of ["missing", "invalid", "negative", "over-100"]) {
    await page.goto(`/?template=P04&theme=digital&case=${invalidCase}&capture`);
    await expect(page.locator('[data-chart-id="P04"]')).toHaveAttribute("data-state", "invalid");
  }
  await page.goto("/?template=P04&theme=signal&case=extreme&capture");
  await expect(page.locator('[data-chart-id="P04"]')).toHaveScreenshot("P04-extreme-mobile.png", { animations: "disabled" });

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=P04&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="P04"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`P04-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
