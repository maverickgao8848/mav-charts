import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;
async function settle(page: Page) { await page.waitForLoadState("networkidle"); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await page.mouse.move(0, 0); }
async function labelledBoxes(chart: ReturnType<Page["locator"]>) { return chart.locator("[data-labelled-donut-label]").evaluateAll((nodes) => nodes.map((node) => { const content = node.querySelector("[data-labelled-donut-label-content]") as SVGGraphicsElement; const rect = content.getBoundingClientRect(); return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, side: node.getAttribute("data-label-side") }; })); }
async function expectLabelsSafe(chart: ReturnType<Page["locator"]>) { const labels = await labelledBoxes(chart), box = await chart.boundingBox(), surface = await chart.locator(".recharts-surface").boundingBox(); for (let first = 0; first < labels.length; first++) for (let second = first + 1; second < labels.length; second++) if (labels[first].side === labels[second].side) expect(labels[first].bottom <= labels[second].top || labels[second].bottom <= labels[first].top).toBe(true); for (const label of labels) { expect(label.left).toBeGreaterThanOrEqual((box?.x ?? 0) - 1); expect(label.right).toBeLessThanOrEqual((box?.x ?? 0) + (box?.width ?? 0) + 1); expect(label.left).toBeGreaterThanOrEqual((surface?.x ?? 0) - 1); expect(label.right).toBeLessThanOrEqual((surface?.x ?? 0) + (surface?.width ?? 0) + 1); } }

test("P03 preserves exact angles and collision-safe direct labels", async ({ page }, testInfo) => {
  test.setTimeout(180_000); test.skip(testInfo.project.name !== "desktop", "Desktop matrix owner");
  const problems: string[] = []; page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); }); page.on("pageerror", (error) => problems.push(error.message));
  for (const [layout, viewport] of Object.entries(layouts)) for (const system of systems) {
    await page.setViewportSize(viewport); await page.goto(`/?template=P03&theme=${system}&capture`); await settle(page);
    const chart = page.locator('[data-chart-id="P03"]'), group = chart.getByRole("group", { name: "Labelled donut interactive chart" });
    await expect(chart).toHaveAttribute("data-state", "ready"); await expect(group).toHaveAttribute("data-total", "100"); await expect(group).toHaveAttribute("data-rendered-count", "3"); await expect(group).toHaveAttribute("data-labelled-donut-animation", "false"); await expect(chart.locator(".recharts-sector")).toHaveCount(3); await expect(chart.locator("[data-labelled-donut-label]")).toHaveCount(3);
    const angles = await chart.locator("[data-labelled-donut-sector]").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("data-angle")))); expect(angles).toEqual([expect.closeTo(183.6), expect.closeTo(104.4), expect.closeTo(72)]);
    await expectLabelsSafe(chart);
    if (system === "signal") { await expect(chart.locator('[data-focus="true"]')).toHaveAttribute("fill", "#ff0000"); await expect(chart.locator('[data-labelled-donut-sector][fill="#ff0000"]')).toHaveCount(1); }
    if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="P03"]').analyze()).violations).toEqual([]);
    if (layout === "mobile") { const legend = await chart.locator("[data-labelled-donut-legend]").boundingBox(), plot = await chart.locator("[data-labelled-donut-plot]").boundingBox(); expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 2); }
    await expect(chart).toHaveScreenshot(`P03-${system}-${layout}.png`, { animations: "disabled" });
  }
  expect(problems).toEqual([]);
});

test("P03 exposes Recharts motion, mouse tooltip, keyboard status and table", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interactions owner"); await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/?template=P03&theme=signal");
  const chart = page.locator('[data-chart-id="P03"]'), group = chart.getByRole("group", { name: "Labelled donut interactive chart" }); await expect(group).toHaveAttribute("data-labelled-donut-animation", "true"); await expect(chart.locator('[data-mav-entry="labelled-donut"]')).toHaveCount(3);
  await chart.locator('[data-labelled-donut-label="Direct sales"] [data-labelled-donut-label-content]').hover(); await expect(chart.getByRole("tooltip")).toContainText("Direct sales"); await expect(chart.getByRole("tooltip")).toContainText("51 · 51%");
  await page.mouse.move(0, 0); await group.focus(); await group.press("End"); await expect(chart.getByRole("status")).toContainText("Licensing: 20; share 20%"); await expect(chart.getByRole("table")).toContainText("Share of reported total");
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/?template=P03&theme=signal"); await expect(page.locator('[data-mav-entry="labelled-donut"]')).toHaveCount(0); await expect(page.getByRole("group", { name: "Labelled donut interactive chart" })).toHaveAttribute("data-labelled-donut-animation", "false");
});

test("P03 edge fixtures preserve missing, zero, extremes and full labels", async ({ browser }, testInfo) => {
  test.setTimeout(180_000); test.skip(testInfo.project.name !== "desktop", "Desktop edges owner");
  for (const edge of ["empty", "single", "missing", "zero", "all-zero", "equal", "extreme", "long-label", "many", "negative", "duplicate", "nonfinite", "blank"] as const) {
    const page = await browser.newPage({ viewport: layouts.mobile }); await page.goto(`/?template=P03&theme=${edge === "long-label" ? "editorial" : "signal"}&case=${edge}&capture`); await settle(page); const chart = page.locator('[data-chart-id="P03"]'), invalid = ["negative", "duplicate", "nonfinite", "blank"].includes(edge);
    await expect(chart).toHaveAttribute("data-state", edge === "empty" ? "empty" : invalid ? "invalid" : "ready");
    if (edge === "missing") { await expect(chart.getByRole("group", { name: "Labelled donut interactive chart" })).toHaveAttribute("data-missing-count", "1"); await expect(chart.locator('[data-labelled-donut-sector="Unreported"]')).toHaveCount(0); await expect(chart.getByRole("table")).toContainText("Missing"); }
    if (edge === "zero") { await expect(chart.getByRole("group", { name: "Labelled donut interactive chart" })).toHaveAttribute("data-zero-count", "1"); await expect(chart.locator('[data-labelled-donut-sector="No contribution"]')).toHaveCount(0); await expect(chart.getByRole("table")).toContainText("Zero"); }
    if (edge === "all-zero") await expect(chart.locator("[data-labelled-donut-no-area]")).toBeVisible();
    if (edge === "extreme") { const totalAngle = await chart.locator("[data-labelled-donut-sector]").evaluateAll((nodes) => nodes.reduce((sum, node) => sum + Number(node.getAttribute("data-angle")), 0)); expect(totalAngle).toBeCloseTo(360, 5); }
    if (edge === "long-label") await expect(chart.getByRole("table")).toContainText("Direct enterprise distribution across North America");
    if (["long-label", "many", "extreme"].includes(edge)) await expectLabelsSafe(chart);
    expect(await chart.locator('[role="tooltip"]').count()).toBe(0); await expect(chart).toHaveScreenshot(`P03-${edge}-mobile.png`, { animations: "disabled" }); await page.close();
  }
});

test("P03 thumbnails are true scaled wide boards", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnail owner"); await page.setViewportSize(layouts.wide);
  for (const system of systems) { await page.goto(`/?template=P03&theme=${system}&capture`); await settle(page); const chart = page.locator('[data-chart-id="P03"]'); await chart.evaluate((node) => { (node as HTMLElement).style.transform = "scale(.25)"; (node as HTMLElement).style.transformOrigin = "top left"; }); const box = await chart.boundingBox(); expect(box?.width).toBeCloseTo(240, 0); expect(box?.height).toBeCloseTo(156, 0); await expect(page).toHaveScreenshot(`P03-${system}-thumbnail.png`, { animations: "disabled", clip: box! }); }
});
