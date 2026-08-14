import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("F04 renders an honest ordered conversion funnel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the full matrix");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", (error) => problems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=F04&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="F04"]');
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.locator("[data-funnel-stage]")).toHaveCount(4);
      await expect(chart.locator("[data-funnel-gap]")).toHaveCount(0);
      await expect(chart.locator('[data-mav-entry="funnel"]')).toHaveCount(0);
      const widths = await chart.locator("[data-funnel-stage]").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-upper-width"))));
      expect(widths.every((width, index) => index === 0 || width <= widths[index - 1])).toBeTruthy();
      expect(widths[1] / widths[0]).toBeCloseTo(0.62, 2); expect(widths[2] / widths[0]).toBeCloseTo(0.31, 2); expect(widths[3] / widths[0]).toBeCloseTo(0.128, 2);
      await expect(chart.locator("[data-funnel-direct-loss]")).toHaveCount(1);
      await expect(chart.locator("[data-funnel-direct-loss]")).toContainText("LOSS 380");
      const chartBox = await chart.boundingBox(), directBox = await chart.locator("[data-funnel-direct-loss]").boundingBox();
      expect((directBox?.x ?? 0)).toBeGreaterThanOrEqual(chartBox?.x ?? 0); expect((directBox?.x ?? 0) + (directBox?.width ?? 0)).toBeLessThanOrEqual((chartBox?.x ?? 0) + (chartBox?.width ?? 0));
      if (system === "signal") { await expect(chart.locator('[data-focus="true"] [data-funnel-path]')).toHaveAttribute("fill", "#ff0000"); for (const stage of await chart.locator('[data-focus="false"] [data-funnel-path]').all()) await expect(stage).toHaveAttribute("fill", "#f7f7f2"); }
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="F04"]').analyze()).violations).toEqual([]);
      if (layout === "mobile") { const legend = await chart.locator("[data-funnel-legend]").boundingBox(), plot = await chart.locator(".recharts-funnel-trapezoid").first().boundingBox(); expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 1); for (const label of await chart.locator("[data-funnel-stage-label], [data-funnel-stage-value]").all()) { const box = await label.boundingBox(); expect(box?.x ?? -1).toBeGreaterThanOrEqual((chartBox?.x ?? 0) - 1); expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((chartBox?.x ?? 0) + (chartBox?.width ?? 0) + 1); } }
      await expect(chart).toHaveScreenshot(`F04-${system}-${layout}.png`, { animations: "disabled" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=F04&theme=signal&capture");
  const chart = page.locator('[data-chart-id="F04"]');
  await chart.locator('[data-funnel-stage="Valid demand"] [data-funnel-path]').hover();
  await expect(chart.locator("[data-funnel-tooltip]")).toContainText("Value: 620"); await expect(chart.locator("[data-funnel-tooltip]")).toContainText("Conversion from previous: 62%"); await expect(chart.locator("[data-funnel-tooltip]")).toContainText("Loss from previous: 380");
  await page.mouse.move(0, 0); const interactive = chart.getByRole("group", { name: "Funnel stage interactive chart" }); await interactive.focus(); await interactive.press("End"); await expect(chart.getByRole("status")).toContainText("Closed deals: 128; conversion from previous 41.3%; loss from previous 182");
  await expect(chart.getByRole("table")).toContainText("Market leads"); await expect(chart.getByRole("table")).toContainText("62%");

  await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/?template=F04&theme=signal"); await expect(page.locator('[data-mav-entry="funnel"]')).toHaveCount(4);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/?template=F04&theme=signal"); await expect(page.locator('[data-mav-entry="funnel"]')).toHaveCount(0); await expect(page.getByRole("group", { name: "Funnel stage interactive chart" })).toHaveAttribute("data-funnel-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of ["empty", "single", "missing", "zero", "flat", "ties", "extreme", "long-label", "negative", "increasing", "duplicate", "nonfinite", "blank"] as const) {
    await page.goto(`/?template=F04&theme=${edge === "missing" || edge === "ties" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`); await page.evaluate(() => window.scrollTo(0, 0)); await page.mouse.move(0, 0);
    const edgeChart = page.locator('[data-chart-id="F04"]');
    if (["negative", "increasing", "duplicate", "nonfinite", "blank"].includes(edge)) await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty") await expect(edgeChart).toHaveAttribute("data-state", "empty");
    else await expect(edgeChart).toHaveAttribute("data-state", "ready");
    if (edge === "missing") { const gap = edgeChart.locator('[data-funnel-gap="Qualified"]'); await expect(edgeChart.locator("[data-funnel-stage]")).toHaveCount(2); await expect(gap).toHaveCount(1); await expect(gap).toHaveAttribute("data-gap-kind", "non-quantitative"); await expect(gap).toHaveAttribute("data-no-quantitative-width", "true"); await expect(gap).not.toHaveAttribute("data-upper-width"); await expect(gap).not.toHaveAttribute("data-lower-width"); const gapLine = gap.locator("[data-funnel-gap-line]"); const x1 = Number(await gapLine.getAttribute("x1")), x2 = Number(await gapLine.getAttribute("x2")); expect(x2 - x1).toBeGreaterThanOrEqual(48); expect(x2 - x1).toBeLessThanOrEqual(96); await expect(gap).toContainText("MISSING · WIDTH UNKNOWN"); const knownWidths = await edgeChart.locator("[data-funnel-stage]").evaluateAll((nodes) => nodes.map((node) => ({ upper: Number(node.getAttribute("data-upper-width")), lower: Number(node.getAttribute("data-lower-width")) }))); expect(knownWidths.every(({ upper, lower }) => Math.abs(upper - lower) < 0.01)).toBeTruthy(); await gap.hover(); await expect(edgeChart.locator("[data-funnel-tooltip]")).toContainText("Value: Missing"); await expect(edgeChart.locator("[data-funnel-tooltip]")).toContainText("Conversion from previous: N/A"); await expect(edgeChart.locator("[data-funnel-tooltip]")).toContainText("Loss from previous: N/A"); await page.mouse.move(0, 0); await expect(edgeChart.getByRole("table")).toContainText("QualifiedMissingN/AN/A"); }
    if (edge === "zero") { await expect(edgeChart.locator('[data-funnel-stage="Won"]')).toHaveAttribute("data-value", "0"); await expect(edgeChart.locator("[data-funnel-gap]")).toHaveCount(0); }
    if (edge === "ties") { await expect(edgeChart.locator('[data-focus="true"]')).toHaveCount(1); await expect(edgeChart.locator('[data-focus="true"]')).toHaveAttribute("data-stage-index", "0"); }
    if (edge === "flat") { await expect(edgeChart.locator('[data-focus="true"]')).toHaveCount(0); await expect(edgeChart.locator("[data-funnel-direct-loss]")).toHaveCount(0); }
    if (edge === "long-label") await expect(edgeChart.getByRole("table")).toContainText("All visitors arriving from international campaign channels");
    expect(await edgeChart.locator("[data-funnel-tooltip]").count()).toBe(0);
    await expect(edgeChart).toHaveScreenshot(`F04-${edge}-mobile.png`, { animations: "disabled" });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide); await page.goto(`/?template=F04&theme=${system}&capture`); const thumbnail = page.locator('[data-chart-id="F04"]');
    await thumbnail.evaluate((node) => { const element = node as HTMLElement; element.style.width = "960px"; element.style.height = "624px"; element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    const box = await thumbnail.boundingBox(); expect(box?.width).toBeCloseTo(240, 0); expect(box?.height).toBeCloseTo(156, 0); await expect(thumbnail).toHaveScreenshot(`F04-${system}-thumbnail-25pct.png`, { animations: "disabled" });
  }
  expect(problems).toEqual([]);
});
