import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;
const inside = (a: DOMRect, b: DOMRect) => a.x >= b.x - 1 && a.y >= b.y - 1 && a.x + a.width <= b.x + b.width + 1 && a.y + a.height <= b.y + b.height + 1;
const overlap = (a: DOMRect, b: DOMRect) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
async function settle(page: Page) { await page.waitForLoadState("networkidle"); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))); await page.mouse.move(0, 0); }

test("F01 renders proportional one-level treemaps across systems and layouts", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the matrix");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", (error) => problems.push(error.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=F01&theme=${system}&capture`); await settle(page);
      const chart = page.locator('[data-chart-id="F01"]'), group = chart.getByRole("group", { name: "Treemap interactive chart" });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-total", "100");
      await expect(group).toHaveAttribute("data-rendered-count", "5");
      await expect(group).toHaveAttribute("data-treemap-animation", "false");
      await expect(chart.locator("[data-treemap-tile]")).toHaveCount(5);
      await expect(chart.locator('[data-treemap-tile="Company A"]')).toHaveAttribute("data-share", "0.34");
      const areas = await chart.locator("[data-treemap-tile] rect").evaluateAll((nodes) => nodes.map((node) => { const box = node.getBoundingClientRect(); return box.width * box.height; }));
      expect(areas[0] / areas[1]).toBeCloseTo(34 / 24, 1);
      if (system === "signal") {
        await expect(chart.locator('[data-treemap-tile="Company A"] rect')).toHaveAttribute("fill", "#ff0000");
        await expect(chart.locator('[data-treemap-tile="Company B"] rect')).toHaveAttribute("fill", "#f7f7f2");
        await expect(chart.locator('[data-treemap-tile="Company C"] rect')).toHaveAttribute("fill", "#8f1712");
      }
      const tileBounds = await chart.locator("[data-treemap-tile]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
      for (let i = 0; i < tileBounds.length; i++) for (let j = i + 1; j < tileBounds.length; j++) expect(overlap(tileBounds[i] as DOMRect, tileBounds[j] as DOMRect)).toBe(false);
      const chartBox = await chart.boundingBox(), labels = await chart.locator("[data-treemap-label]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
      for (const label of labels) if (chartBox) expect(inside(label as DOMRect, chartBox as DOMRect)).toBe(true);
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="F01"]').analyze()).violations).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart.getByText("MARKET MAP · AREA ENCODES REPORTED VALUE", { exact: true }).boundingBox(), legend = await chart.locator("[data-treemap-legend]").boundingBox(), firstTile = await chart.locator("[data-treemap-tile]").first().boundingBox();
        expect((subtitle?.y ?? 0) + (subtitle?.height ?? 0)).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((firstTile?.y ?? 0) + 1);
      }
      await expect(chart).toHaveScreenshot(`F01-${system}-${layout}.png`, { animations: "disabled" });
    }
  }
  expect(problems).toEqual([]);
});

test("F01 exposes entry motion, exact tooltip, keyboard status and table", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interaction owner");
  await page.emulateMedia({ reducedMotion: "no-preference" }); await page.goto("/?template=F01&theme=signal");
  const chart = page.locator('[data-chart-id="F01"]');
  await expect(chart.getByRole("group", { name: "Treemap interactive chart" })).toHaveAttribute("data-treemap-animation", "true");
  await expect(chart.locator('[data-mav-entry="treemap-tile"]')).toHaveCount(5);
  await chart.locator('[data-treemap-tile="Company B"]').hover();
  await expect(page.getByText("Value: 24", { exact: true })).toBeVisible(); await expect(page.getByText("Share: 24.0%", { exact: true })).toBeVisible(); await expect(page.getByText("Parent: Leaders", { exact: true })).toBeVisible();
  const group = chart.getByRole("group", { name: "Treemap interactive chart" }); await group.focus(); await group.press("End");
  await expect(page.getByRole("status")).toContainText("Others: 15; 15.0% of reported total; parent Long tail");
  await expect(chart.getByRole("table")).toContainText("Share of reported total");
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/?template=F01&theme=signal");
  await expect(page.locator('[data-mav-entry="treemap-tile"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Treemap interactive chart" })).toHaveAttribute("data-treemap-animation", "false");
});

test("F01 edge cases keep zero and missing out of area", async ({ browser }, testInfo) => {
  test.setTimeout(180_000); test.skip(testInfo.project.name !== "desktop", "One desktop project owns edges");
  for (const edge of ["empty", "single", "missing", "zero", "all-zero", "extreme", "long-label", "many", "equal", "negative", "invalid", "duplicate", "nonfinite", "blank-parent"] as const) {
    const page = await browser.newPage({ viewport: layouts.mobile }), problems: string[] = [];
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); }); page.on("pageerror", (error) => problems.push(error.message));
    await page.goto(`/?template=F01&theme=signal&case=${edge}&capture`); await settle(page);
    const chart = page.locator('[data-chart-id="F01"]'), group = chart.getByRole("group", { name: "Treemap interactive chart" });
    const invalid = ["negative", "invalid", "duplicate", "nonfinite", "blank-parent"].includes(edge);
    await expect(chart).toHaveAttribute("data-state", edge === "empty" ? "empty" : invalid ? "invalid" : "ready");
    if (edge === "single") { await expect(group).toHaveAttribute("data-rendered-count", "1"); const tile = await chart.locator("[data-treemap-tile]").boundingBox(), root = await group.boundingBox(); expect(tile && root ? tile.width * tile.height / (root.width * root.height) : 0).toBeGreaterThan(.7); }
    if (edge === "missing") { await expect(group).toHaveAttribute("data-rendered-count", "2"); await expect(group).toHaveAttribute("data-missing-count", "1"); await expect(chart.locator('[data-treemap-tile="Not reported"]')).toHaveCount(0); await expect(chart.getByRole("table")).toContainText("Missing"); }
    if (edge === "zero") { await expect(group).toHaveAttribute("data-zero-count", "1"); await expect(chart.locator('[data-treemap-tile="Zero share"]')).toHaveCount(0); await expect(chart.getByRole("table")).toContainText("Zero"); }
    if (edge === "all-zero") { await expect(group).toHaveAttribute("data-rendered-count", "0"); await expect(chart.locator("[data-treemap-no-area]")).toBeVisible(); }
    if (edge === "extreme") { await expect(group).toHaveAttribute("data-positive-count", "3"); await expect(group).toHaveAttribute("data-rendered-count", "1"); await expect(group).toHaveAttribute("data-subpixel-count", "2"); await expect(chart.locator("[data-treemap-tile]")).toHaveCount(1); await expect(chart.locator("[data-treemap-subpixel-note]")).toContainText("2 SUB-PIXEL VALUES · TABLE ONLY"); await expect(chart.getByRole("table")).toContainText("Tiny"); await expect(chart.getByRole("table")).toContainText("Smaller"); }
    if (edge === "long-label") await expect(chart.getByRole("table")).toContainText("North American enterprise reporting division");
    if (edge === "many") await expect(group).toHaveAttribute("data-rendered-count", "18");
    expect(await chart.locator("[role=tooltip]").count()).toBe(0);
    await page.reload(); await settle(page); await page.evaluate(() => window.scrollTo(0, 0));
    const box = await chart.boundingBox(); expect(box).not.toBeNull();
    await expect(chart).toHaveScreenshot(`F01-${edge}-mobile.png`, { animations: "disabled" });
    const title = chart.getByText("The leader controls one third of the reported market", { exact: true }), subtitle = chart.getByText("MARKET MAP · AREA ENCODES REPORTED VALUE", { exact: true }), footer = chart.locator("footer");
    for (const element of [title, subtitle, footer]) await expect(element).toBeVisible();
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1_200); expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500); expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    expect(problems).toEqual([]); await page.close();
  }
});

test("F01 thumbnails use a true scaled wide board", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnail owner"); await page.setViewportSize(layouts.wide);
  for (const system of systems) { await page.goto(`/?template=F01&theme=${system}&capture`); await settle(page); const chart = page.locator('[data-chart-id="F01"]'); await chart.evaluate((node) => { (node as HTMLElement).style.transform = "scale(.25)"; (node as HTMLElement).style.transformOrigin = "top left"; }); const box = await chart.boundingBox(); expect(box?.width).toBeCloseTo(240, 0); expect(box?.height).toBeCloseTo(156, 0); await expect(page).toHaveScreenshot(`F01-${system}-thumbnail.png`, { animations: "disabled", clip: box! }); }
});
