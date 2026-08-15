import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C08 renders honest signed values around one zero baseline", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport matrix.");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C08&theme=${system}&capture`); await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C08"]'); await expect(chart).toBeVisible(); await expect(chart).toHaveAttribute("data-visual-system", system); await expect(chart.getByRole("group", { name: "Diverging bars interactive chart" })).toHaveAttribute("data-diverging-animation", "false");
      const bars = chart.locator("[data-diverging-bar]"); await expect(bars).toHaveCount(4); expect(await bars.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-category-index")))).toEqual(["0", "1", "2", "3"]);
      const zeroLine = await chart.locator('[data-zero-reference="true"]').boundingBox(); const zeroX = (zeroLine?.x ?? Number.NaN) + (zeroLine?.width ?? 0) / 2; expect(Number.isFinite(zeroX)).toBe(true);
      for (const label of ["North America", "Europe", "Asia Pacific", "Latin America"]) { const group = chart.locator(`[data-diverging-bar="${label}"]`); const value = Number(await group.getAttribute("data-value")); const box = await group.locator("rect").boundingBox(); expect(box).not.toBeNull(); if (value > 0) expect(box?.x ?? 0).toBeCloseTo(zeroX, 0); if (value < 0) expect((box?.x ?? 0) + (box?.width ?? 0)).toBeCloseTo(zeroX, 0); }
      if (system === "signal") { await expect(bars.nth(0).locator("rect")).toHaveAttribute("fill", "#ff0000"); for (const bar of await bars.all().then((items) => items.slice(1))) await expect(bar.locator("rect")).toHaveAttribute("fill", "#f7f7f2"); }
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="C08"]').analyze()).violations).toEqual([]);
      if (layout === "mobile") { const subtitle = await chart.getByText("SIGNED CHANGE · SHARED ZERO BASELINE", { exact: true }).boundingBox(), legend = await chart.locator("[data-diverging-legend]").boundingBox(), plot = await chart.locator(".recharts-cartesian-grid").boundingBox(); expect((subtitle?.y ?? 0) + (subtitle?.height ?? 0)).toBeLessThanOrEqual((legend?.y ?? 0) + 1); expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 1); }
      await expect(chart).toHaveScreenshot(`C08-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide); await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/?template=C08&theme=signal"); await expect(page.locator('[data-mav-entry="diverging-bar"]')).toHaveCount(4); await page.locator('[data-diverging-bar="North America"] rect').hover(); await expect(page.getByText("Change: 35", { exact: true })).toBeVisible(); await expect(page.getByText("Direction: Positive", { exact: true })).toBeVisible(); const interactive = page.getByRole("group", { name: "Diverging bars interactive chart" }); await interactive.focus(); await interactive.press("ArrowDown"); await expect(page.getByRole("status")).toContainText("Europe: Change -18; negative"); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/?template=C08&theme=signal"); await expect(page.locator('[data-mav-entry="diverging-bar"]')).toHaveCount(0);

  await page.setViewportSize(layouts.mobile);
  for (const edge of ["empty", "single", "missing", "leading-null", "all-positive", "all-negative", "mixed", "zero", "extreme", "long-label", "ties"] as const) {
    await page.goto(`/?template=C08&theme=${edge === "mixed" || edge === "zero" || edge === "leading-null" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`); await page.evaluate(() => document.fonts.ready); const chart = page.locator('[data-chart-id="C08"]');
    if (edge === "missing") { await expect(chart.locator("[data-diverging-bar]")).toHaveCount(2); await expect(chart.locator('[data-diverging-tick="Not reported"]')).toBeVisible(); await expect(chart.getByRole("table")).toContainText("Missing"); }
    if (edge === "leading-null") {
      await expect(chart.locator('[data-diverging-tick="Not reported first"]')).toBeVisible();
      await expect(chart.locator('[data-diverging-bar="First reported"] rect')).toHaveAttribute("fill", "#ff0000");
      await expect(chart.locator('[data-diverging-bar="Reported decline"] rect')).toHaveAttribute("fill", "#f7f7f2");
      await expect(chart.locator('[data-diverging-bar]')).toHaveCount(2);
    }
    if (edge === "zero") { const zero = chart.locator('[data-diverging-bar="Zero retained"] rect'); const box = await zero.boundingBox(); expect(box?.width).toBeLessThanOrEqual(0.5); await expect(chart.locator('[data-diverging-bar="Zero retained"] [data-diverging-value]')).toContainText("0"); }
    if (edge === "long-label") { await expect(chart.locator("[data-diverging-tick]").first()).toContainText("Enterprise customer…"); await expect(chart.getByRole("table")).toContainText("Enterprise customers across northern metropolitan territories"); }
    await expect(chart).toHaveScreenshot(`C08-${edge}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C08&theme=digital&case=invalid&capture"); await expect(page.locator('[data-chart-id="C08"]')).toHaveAttribute("data-state", "invalid");

  for (const system of systems) { await page.setViewportSize(layouts.wide); await page.goto(`/?template=C08&theme=${system}&capture`); await page.evaluate(() => document.fonts.ready); const chart = page.locator('[data-chart-id="C08"]'); await chart.evaluate((node) => { const element = node as HTMLElement; element.style.width = "960px"; element.style.height = "624px"; element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; }); const box = await chart.boundingBox(); expect(box?.width).toBeCloseTo(240, 0); expect(box?.height).toBeCloseTo(156, 0); await expect(chart).toHaveScreenshot(`C08-${system}-thumbnail-25pct.png`, { animations: "disabled" }); }
  expect(problems).toEqual([]);
});
