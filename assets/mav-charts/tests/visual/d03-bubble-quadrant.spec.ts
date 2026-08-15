import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("D03 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=D03&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D03"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Bubble quadrant interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator('[data-bubble-label]')).toHaveCount(6);
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="D03"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`D03-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D03&theme=digital");
  await expect(page.locator('[data-chart-id="D03"] [data-mav-entry="bubble"]')).toHaveCount(6);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D03&theme=digital");
  await expect(page.locator('[data-chart-id="D03"] [data-mav-entry="bubble"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Bubble quadrant interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  await page.goto("/?template=D03&theme=editorial&case=long-label&capture");
  await expect(page.locator('[data-chart-id="D03"]')).toHaveScreenshot("D03-long-label-mobile.png", { animations: "disabled" });
  await page.goto("/?template=D03&theme=signal&case=negative&capture");
  await expect(page.locator('[data-chart-id="D03"]')).toHaveScreenshot("D03-negative-mobile.png", { animations: "disabled" });
  await page.goto("/?template=D03&theme=digital&case=zero-size&capture");
  await expect(page.locator('[data-chart-id="D03"]')).toHaveScreenshot("D03-zero-size-mobile.png", { animations: "disabled" });
  await page.goto("/?template=D03&theme=digital&case=extreme&capture");
  await expect(page.locator('[data-chart-id="D03"]')).toHaveScreenshot("D03-extreme-mobile.png", { animations: "disabled" });
  await page.goto("/?template=D03&theme=editorial&case=overlap&capture");
  await expect(page.locator('[data-chart-id="D03"]')).toHaveScreenshot("D03-overlap-mobile.png", { animations: "disabled" });
  for (const invalidCase of ["missing", "invalid"]) {
    await page.goto(`/?template=D03&theme=digital&case=${invalidCase}&capture`);
    await expect(page.locator('[data-chart-id="D03"]')).toHaveAttribute("data-state", "invalid");
  }

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=D03&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="D03"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`D03-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
