import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("D04 renders honest five-number summaries and outliers", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the responsive matrix");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", (error) => problems.push(error.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=D04&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D04"]');
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.locator("[data-box-mark]")).toHaveCount(4);
      await expect(chart.locator("[data-box-iqr]")).toHaveCount(4);
      await expect(chart.locator("[data-box-whisker]")).toHaveCount(4);
      await expect(chart.locator("[data-box-median]")).toHaveCount(4);
      await expect(chart.locator("[data-box-outlier]")).toHaveCount(4);
      await expect(chart.locator('[data-mav-entry="box-plot"]')).toHaveCount(0);
      const positions = await chart.locator("[data-box-mark]").evaluateAll((nodes) => nodes.map((node) => ({ x: Number(node.getAttribute("data-x")), width: Number(node.getAttribute("data-box-width")) })));
      expect(positions[1].x - positions[0].x).toBeCloseTo(positions[2].x - positions[1].x, 3);
      expect(positions[2].x - positions[1].x).toBeCloseTo(positions[3].x - positions[2].x, 3);
      expect(positions.every(({ width }) => width > 0 && width <= 72)).toBe(true);
      for (const mark of await chart.locator("[data-box-mark]").all()) {
        const values = await mark.evaluate((node) => ["data-min-y", "data-q1-y", "data-median-y", "data-q3-y", "data-max-y"].map((key) => Number(node.getAttribute(key))));
        expect(values[0]).toBeGreaterThanOrEqual(values[1]); expect(values[1]).toBeGreaterThanOrEqual(values[2]); expect(values[2]).toBeGreaterThanOrEqual(values[3]); expect(values[3]).toBeGreaterThanOrEqual(values[4]);
        const primitive = await mark.evaluate((node) => ({ minY: Number(node.getAttribute("data-min-y")), q1Y: Number(node.getAttribute("data-q1-y")), medianY: Number(node.getAttribute("data-median-y")), q3Y: Number(node.getAttribute("data-q3-y")), maxY: Number(node.getAttribute("data-max-y")), whiskerY1: Number(node.querySelector("[data-box-whisker]")?.getAttribute("y1")), whiskerY2: Number(node.querySelector("[data-box-whisker]")?.getAttribute("y2")), boxY: Number(node.querySelector("[data-box-iqr]")?.getAttribute("y")), boxHeight: Number(node.querySelector("[data-box-iqr]")?.getAttribute("height")), medianLineY: Number(node.querySelector("[data-box-median]")?.getAttribute("y1")) }));
        expect(primitive.whiskerY1).toBeCloseTo(primitive.maxY, 6); expect(primitive.whiskerY2).toBeCloseTo(primitive.minY, 6); expect(primitive.boxY).toBeCloseTo(primitive.q3Y, 6); expect(primitive.boxHeight).toBeCloseTo(primitive.q1Y - primitive.q3Y, 6); expect(primitive.medianLineY).toBeCloseTo(primitive.medianY, 6);
      }
      const core = chart.locator('[data-box-mark="Core"]'), coreMinY = Number(await core.getAttribute("data-min-y")), coreMaxY = Number(await core.getAttribute("data-max-y"));
      expect(Number(await core.locator('[data-box-outlier="9"]').getAttribute("cy"))).toBeGreaterThan(coreMinY);
      expect(Number(await core.locator('[data-box-outlier="61"]').getAttribute("cy"))).toBeLessThan(coreMaxY);
      if (system === "signal") {
        await expect(chart.locator('[data-box-mark="Core"] [data-box-iqr]')).toHaveAttribute("fill", "#ff0000");
        for (const label of ["Growth", "Scale", "Frontier"]) await expect(chart.locator(`[data-box-mark="${label}"] [data-box-iqr]`)).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="D04"]').analyze()).violations).toEqual([]);
      if (layout === "mobile") { const legend = await chart.locator("[data-box-legend]").boundingBox(), svg = await chart.locator("[data-box-svg]").boundingBox(); expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((svg?.y ?? 0) + 1); for (const label of await chart.locator("[data-box-direct-median]").all()) { const box = await label.boundingBox(); expect(box?.x).toBeGreaterThanOrEqual((svg?.x ?? 0) - 1); expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((svg?.x ?? 0) + (svg?.width ?? 0) + 1); } }
      await expect(chart).toHaveScreenshot(`D04-${system}-${layout}.png`, { animations: "disabled" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=D04&theme=signal&capture");
  const chart = page.locator('[data-chart-id="D04"]');
  const core = chart.locator('[data-box-mark="Core"]');
  await core.hover();
  await expect(chart.locator('[data-box-tooltip="mouse"]')).toContainText("Min 18; Q1 26; Median 34; Q3 43; Max 52; Outliers 9, 61");
  await page.mouse.move(0, 0);
  const interactive = chart.getByRole("group", { name: "Box plot interactive chart" });
  await interactive.focus(); await interactive.press("End");
  await expect(chart.getByRole("status")).toContainText("Frontier");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D04&theme=signal");
  await expect(page.locator('[data-mav-entry="box-plot"]')).toHaveCount(4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D04&theme=signal");
  await expect(page.locator('[data-mav-entry="box-plot"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Box plot interactive chart" })).toHaveAttribute("data-box-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of ["empty", "single", "missing", "negative", "constant", "extreme", "outliers", "long-label", "invalid-order", "duplicate", "nonfinite", "invalid-outlier", "partial-missing"] as const) {
    await page.goto(`/?template=D04&theme=${edge === "missing" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`);
    await page.mouse.move(0, 0);
    const edgeChart = page.locator('[data-chart-id="D04"]');
    if (["invalid-order", "duplicate", "nonfinite", "invalid-outlier", "partial-missing"].includes(edge)) await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty") await expect(edgeChart).toHaveAttribute("data-state", "empty");
    if (edge === "missing") { await expect(edgeChart.locator('[data-box-mark="Not reported"]')).toHaveCount(0); await expect(edgeChart.locator('[data-box-missing="Not reported"]')).toHaveCount(1); await expect(edgeChart.getByRole("table")).toContainText("Missing"); }
    if (edge === "constant") { const flat = edgeChart.locator('[data-box-mark="No spread"]'); await expect(flat.locator("[data-box-iqr]")).toHaveAttribute("height", "0"); const minY = await flat.getAttribute("data-min-y"), maxY = await flat.getAttribute("data-max-y"); expect(minY).toBe(maxY); }
    if (edge === "outliers") { const heavy = edgeChart.locator('[data-box-mark="Heavy tails"]'); await expect(heavy.locator("[data-box-outlier]")).toHaveCount(3); }
    if (edge === "long-label") await expect(edgeChart.getByRole("table")).toContainText("Enterprise customers across northern metropolitan territories");
    expect(await edgeChart.locator('[data-box-tooltip="mouse"]').count()).toBe(0);
    await expect(edgeChart).toHaveScreenshot(`D04-${edge}-mobile.png`, { animations: "disabled" });
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide); await page.goto(`/?template=D04&theme=${system}&capture`);
    const thumb = page.locator('[data-chart-id="D04"]');
    await thumb.evaluate((node) => { const element = node as HTMLElement; element.style.width = "960px"; element.style.height = "624px"; element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    const box = await thumb.boundingBox(); expect(box?.width).toBeCloseTo(240, 0); expect(box?.height).toBeCloseTo(156, 0);
    await expect(thumb).toHaveScreenshot(`D04-${system}-thumbnail-25pct.png`, { animations: "disabled" });
  }
  expect(problems).toEqual([]);
});
