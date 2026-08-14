import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;
const intersects = (a: DOMRect, b: DOMRect) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.mouse.move(0, 0);
}

test("D05 renders honest regression geometry across themes and layouts", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the matrix");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", (error) => problems.push(error.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=D05&theme=${system}&capture`);
      await settle(page);
      const chart = page.locator('[data-chart-id="D05"]');
      const group = chart.getByRole("group", { name: "Regression interactive chart" });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-fit-available", "true");
      await expect(group).toHaveAttribute("data-plotted-count", "5");
      await expect(group).toHaveAttribute("data-regression-animation", "false");
      expect(Number(await group.getAttribute("data-x-domain-min"))).toBeLessThan(12);
      expect(Number(await group.getAttribute("data-x-domain-max"))).toBeGreaterThan(63);
      expect(Number(await group.getAttribute("data-y-domain-min"))).toBeLessThan(18);
      expect(Number(await group.getAttribute("data-y-domain-max"))).toBeGreaterThan(61);
      await expect(chart.locator("[data-regression-point]")).toHaveCount(5);
      await expect(chart.locator(".recharts-line-curve")).toHaveCount(1);
      await expect(chart.locator("[data-regression-equation]")).toContainText("R²");
      const equationBox = await chart.locator("[data-regression-equation]").boundingBox();
      const chartBox = await chart.boundingBox();
      expect(equationBox).not.toBeNull();
      expect(chartBox).not.toBeNull();
      expect(equationBox!.x).toBeGreaterThanOrEqual(chartBox!.x);
      expect(equationBox!.x + equationBox!.width).toBeLessThanOrEqual(chartBox!.x + chartBox!.width + 1);
      if (system === "signal") {
        await expect(chart.locator('[data-regression-point="A"]')).toHaveAttribute("fill", "#ff0000");
        for (const label of ["B", "C", "D", "E"])
          await expect(chart.locator(`[data-regression-point="${label}"]`)).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide") {
        expect((await new AxeBuilder({ page }).include('[data-chart-id="D05"]').analyze()).violations).toEqual([]);
      }
      if (layout === "mobile") {
        const subtitle = await chart.getByText("LEAST SQUARES · ASSOCIATION, NOT CAUSATION", { exact: true }).boundingBox();
        const legend = await chart.locator("[data-regression-legend]").boundingBox();
        const equation = await chart.locator("[data-regression-equation]").boundingBox();
        const plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect((subtitle?.y ?? 0) + (subtitle?.height ?? 0)).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((equation?.y ?? 0) + 1);
        expect((equation?.y ?? 0) + (equation?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 1);
      }
      await expect(chart).toHaveScreenshot(`D05-${system}-${layout}.png`, { animations: "disabled" });
    }
  }
  expect(problems).toEqual([]);
});

test("D05 exposes motion, tooltip, keyboard status and complete table", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interaction owner");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D05&theme=signal");
  const chart = page.locator('[data-chart-id="D05"]');
  await expect(chart.locator('[data-mav-entry="regression-point"]')).toHaveCount(5);
  await expect(chart.getByRole("group", { name: "Regression interactive chart" })).toHaveAttribute("data-regression-animation", "true");
  await chart.locator('[data-regression-point="B"]').hover();
  await expect(page.getByText("X value: 24", { exact: true })).toBeVisible();
  await expect(page.getByText("Y value: 27", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Residual:/)).toBeVisible();
  const group = chart.getByRole("group", { name: "Regression interactive chart" });
  await group.focus();
  await group.press("End");
  await expect(page.getByRole("status")).toContainText("E: X value 63; Y value 61; residual");
  await expect(chart.getByRole("table")).toContainText("Predicted y");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D05&theme=signal");
  await expect(page.locator('[data-mav-entry="regression-point"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Regression interactive chart" })).toHaveAttribute("data-regression-animation", "false");
});

test("D05 edge cases preserve missing, degenerate and overlap semantics", async ({ browser }, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns edge pages");
  for (const edge of ["empty", "single", "missing", "negative", "perfect", "flat-y", "degenerate-x", "extreme", "outlier", "overlap", "long-label", "invalid", "duplicate", "nonfinite"] as const) {
    const page = await browser.newPage({ viewport: layouts.mobile });
    const problems: string[] = [];
    page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
    page.on("pageerror", (error) => problems.push(error.message));
    await page.goto(`/?template=D05&theme=signal&case=${edge}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="D05"]');
    const group = chart.getByRole("group", { name: "Regression interactive chart" });
    const title = chart.getByText("The linear fit explains most of the variation", { exact: true });
    const subtitle = chart.getByText("LEAST SQUARES · ASSOCIATION, NOT CAUSATION", { exact: true });
    const footer = chart.locator("footer");
    for (const element of [title, subtitle, footer]) await expect(element).toBeVisible();
    if (["invalid", "duplicate", "nonfinite"].includes(edge)) await expect(chart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty") await expect(chart).toHaveAttribute("data-state", "empty");
    else await expect(chart).toHaveAttribute("data-state", "ready");
    if (edge === "single") {
      await expect(group).toHaveAttribute("data-fit-available", "false");
      await expect(group).toHaveAttribute("data-fit-reason", "insufficient-points");
      await expect(chart.locator(".recharts-line-curve")).toHaveCount(0);
      await expect(chart.locator("[data-regression-equation]")).toContainText("need at least 2 complete points");
    }
    if (edge === "degenerate-x") {
      await expect(group).toHaveAttribute("data-fit-available", "false");
      await expect(group).toHaveAttribute("data-fit-reason", "zero-x-variance");
      await expect(chart.locator("[data-regression-point]")).toHaveCount(3);
      await expect(chart.locator(".recharts-line-curve")).toHaveCount(0);
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-plotted-count", "2");
      await expect(chart.locator("[data-regression-point]")).toHaveCount(2);
      await expect(chart.locator('[data-regression-point="Missing X"]')).toHaveCount(0);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "perfect") {
      expect(Number(await group.getAttribute("data-slope"))).toBeCloseTo(2);
      expect(Number(await group.getAttribute("data-intercept"))).toBeCloseTo(1);
      expect(Number(await group.getAttribute("data-r2"))).toBeCloseTo(1);
    }
    if (edge === "flat-y") {
      expect(Number(await group.getAttribute("data-slope"))).toBeCloseTo(0);
      expect(Number(await group.getAttribute("data-r2"))).toBeCloseTo(1);
    }
    if (edge === "negative") {
      expect(Number(await group.getAttribute("data-x-domain-min"))).toBeLessThan(-20);
      expect(Number(await group.getAttribute("data-y-domain-min"))).toBeLessThan(-15);
    }
    if (edge === "overlap") {
      const points = await chart.locator("[data-regression-point]").evaluateAll((nodes) => nodes.map((node) => `${node.getAttribute("cx")}|${node.getAttribute("cy")}`));
      expect(points[0]).toBe(points[1]);
      const labels = await chart.locator("[data-regression-label]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()));
      expect(intersects(labels[0] as DOMRect, labels[1] as DOMRect)).toBe(false);
    }
    if (edge === "long-label") await expect(chart.getByRole("table")).toContainText("First enterprise reporting cohort");
    expect(await chart.locator(".recharts-tooltip-wrapper").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).visibility !== "visible"))).toBe(true);
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    await expect(page).toHaveScreenshot(`D05-${edge}-mobile.png`, { animations: "disabled", clip: box! });
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1_200);
    expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
    expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    if (!["empty", "invalid", "duplicate", "nonfinite"].includes(edge))
      expect((await chart.locator("[data-regression-legend]").screenshot()).byteLength).toBeGreaterThan(500);
    expect(problems).toEqual([]);
    await page.close();
  }
});

test("D05 thumbnails are true scaled wide boards", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnail owner");
  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=D05&theme=${system}&capture`);
    await settle(page);
    await page.locator('[data-chart-id="D05"]').evaluate((node) => { (node as HTMLElement).style.transform = "scale(.25)"; (node as HTMLElement).style.transformOrigin = "top left"; });
    const box = await page.locator('[data-chart-id="D05"]').boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(page).toHaveScreenshot(`D05-${system}-thumbnail.png`, { animations: "disabled", clip: box! });
  }
});
