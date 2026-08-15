import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("D07 preserves honest equal-width pre-binned frequency", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the matrix");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", (error) => problems.push(error.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=D07&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D07"]');
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.getByRole("group", { name: "Histogram interactive chart" })).toHaveAttribute("data-histogram-domain", "0,29.700000000000003");
      await expect(chart.locator("[data-histogram-bar]")).toHaveCount(7);
      await expect(chart.locator("[data-histogram-gap]")).toHaveCount(0);
      await expect(chart.locator('[data-mav-entry="histogram"]')).toHaveCount(0);
      const rectangles = await chart.locator("[data-histogram-rect]").evaluateAll((nodes) => nodes.map((node) => ({ x: Number(node.getAttribute("x")), y: Number(node.getAttribute("y")), width: Number(node.getAttribute("width")), height: Number(node.getAttribute("height")) })));
      expect(Math.max(...rectangles.map(({ width }) => width)) - Math.min(...rectangles.map(({ width }) => width))).toBeLessThanOrEqual(1);
      const baselines = rectangles.map(({ y, height }) => y + height); expect(Math.max(...baselines) - Math.min(...baselines)).toBeLessThanOrEqual(1);
      const counts = [4, 11, 18, 27, 20, 9, 3];
      const scale = rectangles[3].height / counts[3]; for (let index = 0; index < counts.length; index++) expect(rectangles[index].height / counts[index]).toBeCloseTo(scale, 2);
      if (system === "signal") { await expect(chart.locator('[data-peak="true"] [data-histogram-rect]')).toHaveAttribute("fill", "#ff0000"); for (const bar of await chart.locator('[data-peak="false"] [data-histogram-rect]').all()) await expect(bar).toHaveAttribute("fill", "#f7f7f2"); }
      const chartBox = await chart.boundingBox(), directBox = await chart.locator("[data-histogram-direct-peak]").boundingBox();
      expect((directBox?.x ?? 0) >= (chartBox?.x ?? 0)).toBeTruthy(); expect((directBox?.x ?? 0) + (directBox?.width ?? 0)).toBeLessThanOrEqual((chartBox?.x ?? 0) + (chartBox?.width ?? 0));
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="D07"]').analyze()).violations).toEqual([]);
      if (layout === "mobile") { const legend = await chart.locator("[data-histogram-legend]").boundingBox(), grid = await chart.locator(".recharts-cartesian-grid").boundingBox(); expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((grid?.y ?? 0) + 1); const ticks = await chart.locator(".recharts-xAxis .recharts-cartesian-axis-tick").evaluateAll((nodes) => nodes.map((node) => (node as SVGGraphicsElement).getBoundingClientRect()).map(({ left, right }) => ({ left, right }))); for (let index = 1; index < ticks.length; index++) expect(ticks[index].left).toBeGreaterThanOrEqual(ticks[index - 1].right); }
      await expect(chart).toHaveScreenshot(`D07-${system}-${layout}.png`, { animations: "disabled" });
    }
  }
  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=D07&theme=signal&capture");
  const chart = page.locator('[data-chart-id="D07"]');
  await chart.locator('[data-histogram-bar="[30, 40)"] [data-histogram-rect]').hover();
  await expect(chart.locator("[data-histogram-tooltip]")).toContainText("Interval: 30 to 40"); await expect(chart.locator("[data-histogram-tooltip]")).toContainText("Count: 27");
  await page.mouse.move(0, 0); const interactive = chart.getByRole("group", { name: "Histogram interactive chart" }); await interactive.focus(); await interactive.press("End"); await expect(chart.getByRole("status")).toContainText("[60, 70): interval 60 to 70; count 3");
  await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/?template=D07&theme=signal"); await expect(page.locator('[data-mav-entry="histogram"]')).toHaveCount(7);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/?template=D07&theme=signal"); await expect(page.locator('[data-mav-entry="histogram"]')).toHaveCount(0); await expect(page.getByRole("group", { name: "Histogram interactive chart" })).toHaveAttribute("data-histogram-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of ["empty", "single", "missing", "zero-count", "ties", "extreme", "long-label", "negative-range", "invalid-gap", "unequal-width", "overlap", "negative-count", "noninteger", "duplicate", "nonfinite", "blank-label"] as const) {
    await page.goto(`/?template=D07&theme=${edge === "missing" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`); await page.evaluate(() => window.scrollTo(0, 0)); await page.mouse.move(0, 0);
    const edgeChart = page.locator('[data-chart-id="D07"]');
    if (["invalid-gap", "unequal-width", "overlap", "negative-count", "noninteger", "duplicate", "nonfinite", "blank-label"].includes(edge)) await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty") await expect(edgeChart).toHaveAttribute("data-state", "empty");
    if (edge === "missing") { await expect(edgeChart.locator("[data-histogram-bar]")).toHaveCount(2); await expect(edgeChart.locator('[data-histogram-gap="[10, 20)"]')).toHaveCount(1); await expect(edgeChart.getByRole("table")).toContainText("Missing"); }
    if (edge === "zero-count") { await expect(edgeChart.locator("[data-zero-count]")).toHaveCount(2); await expect(edgeChart.locator("[data-histogram-gap]")).toHaveCount(0); }
    if (edge === "ties") { await expect(edgeChart.locator('[data-peak="true"]')).toHaveCount(1); await expect(edgeChart.locator('[data-peak="true"]')).toHaveAttribute("data-bin-index", "0"); }
    if (edge === "long-label") await expect(edgeChart.getByRole("table")).toContainText("First long custom interval label for enterprise accounts");
    expect(await edgeChart.locator("[data-histogram-tooltip]").count()).toBe(0);
    await expect(edgeChart).toHaveScreenshot(`D07-${edge}-mobile.png`, { animations: "disabled" });
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide); await page.goto(`/?template=D07&theme=${system}&capture`); const thumb = page.locator('[data-chart-id="D07"]');
    await thumb.evaluate((node) => { const element = node as HTMLElement; element.style.width = "960px"; element.style.height = "624px"; element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    const box = await thumb.boundingBox(); expect(box?.width).toBeCloseTo(240, 0); expect(box?.height).toBeCloseTo(156, 0); await expect(thumb).toHaveScreenshot(`D07-${system}-thumbnail-25pct.png`, { animations: "disabled" });
  }
  expect(problems).toEqual([]);
});
