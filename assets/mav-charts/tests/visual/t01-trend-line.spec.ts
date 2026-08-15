import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

test("T01 preserves an honest equal-spacing trend with gaps", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the full responsive matrix");
  const browserProblems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) browserProblems.push(message.text());
  });
  page.on("pageerror", (error) => browserProblems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=T01&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T01"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.getByRole("group", { name: "Trend line interactive chart" })).toHaveAttribute("data-trend-animation", "false");
      await expect(chart.locator('[data-mav-entry="trend-line"]')).toHaveCount(0);
      await expect(chart.locator("[data-trend-dot]")).toHaveCount(4);
      await expect(chart.locator("[data-trend-latest]")).toHaveText(/LATEST 57/);
      const positions = await chart.locator("[data-trend-dot]").evaluateAll((nodes) => nodes.map((node) => ({ x: Number(node.getAttribute("cx")), y: Number(node.getAttribute("cy")) })));
      expect(positions[1].x - positions[0].x).toBeCloseTo(positions[2].x - positions[1].x, 3);
      expect(positions[2].x - positions[1].x).toBeCloseTo(positions[3].x - positions[2].x, 3);
      expect(positions.map(({ y }) => y)).toEqual([...positions.map(({ y }) => y)].sort((a, b) => b - a));
      if (layout === "wide") {
        expect((await new AxeBuilder({ page }).include('[data-chart-id="T01"]').analyze()).violations).toEqual([]);
      }
      if (system === "signal") {
        await expect(chart.locator(".recharts-line-curve")).toHaveAttribute("stroke", "#ff0000");
        for (const dot of await chart.locator("[data-trend-dot]").all()) await expect(dot).toHaveAttribute("fill", "#ff0000");
      }
      if (layout === "mobile") {
        const subtitle = await chart.getByText("ONE METRIC · EQUALLY SPACED OBSERVATIONS", { exact: true }).boundingBox();
        const legend = await chart.locator("[data-trend-legend]").boundingBox();
        const plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect((subtitle?.y ?? 0) + (subtitle?.height ?? 0)).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 1);
      }
      await expect(chart).toHaveScreenshot(`T01-${system}-${layout}.png`, { animations: "disabled" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T01&theme=signal");
  await expect(page.locator('[data-mav-entry="trend-line"]')).toHaveCount(4);
  await page.locator('[data-trend-dot="Q2"]').hover();
  await expect(page.getByText("Value: 34", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", { name: "Trend line interactive chart" });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText("Q4: Value 57");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T01&theme=signal");
  await expect(page.locator('[data-mav-entry="trend-line"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Trend line interactive chart" })).toHaveAttribute("data-trend-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of ["empty", "single", "missing", "leading-gap", "trailing-gap", "negative", "constant", "extreme", "long-label", "invalid", "duplicate"] as const) {
    await page.goto(`/?template=T01&theme=${edge === "long-label" ? "editorial" : edge === "missing" ? "signal" : "digital"}&case=${edge}&capture`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const chart = page.locator('[data-chart-id="T01"]');
    expect(await chart.locator(".recharts-tooltip-wrapper").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).visibility !== "visible"))).toBe(true);
    if (["invalid", "duplicate"].includes(edge)) await expect(chart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty") await expect(chart).toHaveAttribute("data-state", "empty");
    if (edge === "single") {
      await expect(chart.locator("[data-trend-dot]")).toHaveCount(1);
      await expect(chart.locator("[data-trend-latest]")).toContainText("LATEST 24");
    }
    if (edge === "missing") {
      await expect(chart.locator("[data-trend-dot]")).toHaveCount(3);
      const path = await chart.locator(".recharts-line-curve").getAttribute("d");
      expect((path?.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      await expect(chart.getByRole("table")).toContainText("Feb");
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "leading-gap") await expect(chart.locator("[data-trend-dot]").first()).toHaveAttribute("data-trend-dot", "First report");
    if (edge === "trailing-gap") await expect(chart.locator("[data-trend-latest]")).toContainText("LATEST 11");
    if (edge === "long-label") await expect(chart.getByRole("table")).toContainText("First enterprise reporting interval");
    await expect(chart).toHaveScreenshot(`T01-${edge}-mobile.png`, { animations: "disabled" });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T01&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T01"]');
    await chart.evaluate((node) => {
      const element = node as HTMLElement;
      element.style.width = "960px";
      element.style.height = "624px";
      element.style.transform = "scale(.25)";
      element.style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(chart).toHaveScreenshot(`T01-${system}-thumbnail-25pct.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
