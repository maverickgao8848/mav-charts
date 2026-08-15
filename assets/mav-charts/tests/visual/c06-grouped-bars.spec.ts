import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C06 renders honest paired bars across systems, layouts and edge cases", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C06&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C06"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Grouped bars interactive chart" })).toHaveAttribute("data-grouped-animation", "false");
      const bars = chart.locator("[data-grouped-bar]");
      await expect(bars).toHaveCount(6);
      expect(await chart.locator('[data-series="value"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-category-index")))).toEqual(["0", "1", "2"]);
      expect(await chart.locator('[data-series="comparison"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-category-index")))).toEqual(["0", "1", "2"]);
      for (const index of [0, 1, 2]) {
        const primaryBox = await chart.locator(`[data-series="value"][data-category-index="${index}"] rect`).boundingBox();
        const comparisonBox = await chart.locator(`[data-series="comparison"][data-category-index="${index}"] rect`).boundingBox();
        expect(primaryBox).not.toBeNull(); expect(comparisonBox).not.toBeNull();
        expect((primaryBox?.y ?? 0) + (primaryBox?.height ?? 0)).toBeLessThanOrEqual((comparisonBox?.y ?? 0) + 0.5);
      }
      if (system === "signal") {
        await expect(chart.locator('[data-grouped-bar="North America:value"] rect')).toHaveAttribute("fill", "#ff0000");
        await expect(chart.locator('[data-grouped-bar="Europe:value"] rect')).toHaveAttribute("fill", "#f7f7f2");
        await expect(chart.locator('[data-series="comparison"] rect').first()).toHaveAttribute("fill", "#8f1712");
      }
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="C06"]').analyze()).violations).toEqual([]);
      if (layout === "mobile") {
        const legend = await chart.locator("[data-grouped-legend]").boundingBox();
        const plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(legend).not.toBeNull(); expect(plot).not.toBeNull();
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 1);
        const ticks = await chart.locator("[data-grouped-tick]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().right));
        expect(ticks.every((right) => right <= (plot?.x ?? 0) + 1)).toBe(true);
      }
      await expect(chart).toHaveScreenshot(`C06-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=C06&theme=signal");
  await expect(page.locator('[data-chart-id="C06"] [data-mav-entry="grouped-bar"]')).toHaveCount(6);
  await page.locator('[data-chart-id="C06"] [data-grouped-bar="North America:value"] rect').hover();
  await expect(page.getByText("Current: 84", { exact: true })).toBeVisible();
  await expect(page.getByText("Prior: 62", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", { name: "Grouped bars interactive chart" });
  await interactive.focus(); await interactive.press("ArrowDown");
  await expect(page.getByRole("status")).toContainText("Europe: Current 68; Prior 74");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C06&theme=signal");
  await expect(page.locator('[data-chart-id="C06"] [data-mav-entry="grouped-bar"]')).toHaveCount(0);

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["empty", "single", "missing-primary", "missing-comparison", "negative", "extreme", "long-label", "flat"] as const) {
    await page.goto(`/?template=C06&theme=${edgeCase === "negative" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital"}&case=${edgeCase}&capture`);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C06"]');
    if (edgeCase === "missing-primary" || edgeCase === "missing-comparison") await expect(chart.locator("[data-grouped-bar]")).toHaveCount(3);
    if (edgeCase === "negative") {
      await expect(chart.locator('[data-zero-reference="true"]')).toHaveCount(1);
      const zeroX = await chart.locator('[data-zero-reference="true"]').getAttribute("x1");
      expect(Number.isFinite(Number(zeroX))).toBe(true);
    }
    if (edgeCase === "long-label") await expect(chart.getByRole("table", { name: "Grouped bar values" })).toContainText("Enterprise customers across northern metropolitan territories");
    await expect(chart).toHaveScreenshot(`C06-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C06&theme=digital&case=invalid&capture");
  await expect(page.locator('[data-chart-id="C06"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C06&theme=${system}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C06"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(chart).toHaveScreenshot(`C06-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
