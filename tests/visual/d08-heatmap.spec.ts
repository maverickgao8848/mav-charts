import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("D08 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=D08&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D08"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Heatmap interactive grid" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator('[data-heatmap-cell]')).toHaveCount(70);
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="D08"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`D08-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D08&theme=digital");
  await expect(page.locator('[data-chart-id="D08"] [data-mav-entry="heat-cell"]')).toHaveCount(70);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D08&theme=digital");
  await expect(page.locator('[data-chart-id="D08"] [data-mav-entry="heat-cell"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  await page.goto("/?template=D08&theme=signal&capture");
  const mobileChart = page.locator('[data-chart-id="D08"]');
  const legendBox = await mobileChart.getByRole("list", { name: "Continuous color scale and missing legend" }).boundingBox();
  const peakBox = await mobileChart.getByLabel(/Peak 100 at/).boundingBox();
  expect(legendBox).not.toBeNull();
  expect(peakBox).not.toBeNull();
  expect((legendBox?.x ?? 0) + (legendBox?.width ?? 0)).toBeLessThanOrEqual((peakBox?.x ?? 0) + 1);
  for (const edgeCase of ["long-label", "missing", "sparse", "negative", "extreme", "constant"]) {
    await page.goto(`/?template=D08&theme=${edgeCase === "negative" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital"}&case=${edgeCase}&capture`);
    await expect(page.locator('[data-chart-id="D08"]')).toHaveScreenshot(`D08-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=D08&theme=digital&case=duplicate&capture");
  await expect(page.locator('[data-chart-id="D08"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=D08&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="D08"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`D08-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
