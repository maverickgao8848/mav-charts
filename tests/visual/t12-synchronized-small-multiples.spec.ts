import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("T12 synchronizes independent honest panels", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the full matrix");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(message.text()); });
  page.on("pageerror", (error) => problems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=T12&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T12"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.getByRole("group", { name: "Synchronized small multiples interactive chart" })).toHaveAttribute("data-sync-id", "t12-synchronized-small-multiples");
      await expect(chart.locator("[data-sync-panel]")).toHaveCount(3);
      await expect(chart.locator('[data-mav-entry="synchronized-small-multiples"]')).toHaveCount(0);
      const domains = await chart.locator("[data-sync-panel]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-sync-domain")));
      expect(new Set(domains).size).toBe(3);
      for (let index = 0; index < 4; index++) {
        const xs = await chart.locator(`[data-index="${index}"]`).evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("cx"))));
        expect(Math.max(...xs) - Math.min(...xs)).toBeLessThanOrEqual(1);
      }
      if (system === "signal") {
        await expect(chart.locator('[data-sync-panel="revenue"] .recharts-line-curve')).toHaveAttribute("stroke", "#ff0000");
        await expect(chart.locator('[data-sync-panel="margin"] .recharts-line-curve')).toHaveAttribute("stroke", "#f7f7f2");
        await expect(chart.locator('[data-sync-panel="nps"] .recharts-line-curve')).toHaveAttribute("stroke", "#f7f7f2");
      }
      const panelBoxes = await chart.locator("[data-sync-panel]").evaluateAll((nodes) => nodes.map((node) => { const box = node.getBoundingClientRect(); return { top: box.top, bottom: box.bottom, height: box.height }; }));
      expect(panelBoxes.every(({ height }) => height > 70)).toBe(true);
      expect(panelBoxes[0].bottom).toBeLessThanOrEqual(panelBoxes[1].top + 1);
      expect(panelBoxes[1].bottom).toBeLessThanOrEqual(panelBoxes[2].top + 1);
      if (layout === "wide") expect((await new AxeBuilder({ page }).include('[data-chart-id="T12"]').analyze()).violations).toEqual([]);
      await expect(chart).toHaveScreenshot(`T12-${system}-${layout}.png`, { animations: "disabled" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=T12&theme=signal&capture");
  const chart = page.locator('[data-chart-id="T12"]');
  await chart.locator('[data-sync-dot="revenue:1"]').hover();
  await expect(chart.locator("[data-sync-tooltip]:visible")).toHaveCount(3);
  for (const panel of ["revenue", "margin", "nps"]) await expect(chart.locator(`[data-sync-panel="${panel}"] [data-sync-tooltip]`)).toContainText("Q2");
  await expect(chart.locator(".recharts-tooltip-cursor")).toHaveCount(3);
  const cursorXs = await chart.locator(".recharts-tooltip-cursor").evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("x") ?? node.getAttribute("x1"))));
  expect(Math.max(...cursorXs) - Math.min(...cursorXs)).toBeLessThanOrEqual(1);
  const interactive = chart.getByRole("group", { name: "Synchronized small multiples interactive chart" });
  await interactive.focus();
  await interactive.press("End");
  await expect(chart.getByRole("status")).toContainText("Q4: Revenue 171 $M; Operating margin 21.6 %; Customer advocacy 52 pts");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T12&theme=signal");
  await expect(page.locator('[data-mav-entry="synchronized-small-multiples"]')).toHaveCount(12);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T12&theme=signal");
  await expect(page.locator('[data-mav-entry="synchronized-small-multiples"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Synchronized small multiples interactive chart" })).toHaveAttribute("data-sync-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of ["empty", "two-panels", "four-panels", "missing", "leading-trailing", "negative", "constant", "extreme", "long-labels", "mismatched-labels", "one-panel", "five-panels", "duplicate-panel", "nonfinite"] as const) {
    await page.goto(`/?template=T12&theme=${edge === "missing" ? "signal" : edge === "long-labels" ? "editorial" : "digital"}&case=${edge}&capture`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const edgeChart = page.locator('[data-chart-id="T12"]');
    expect(await edgeChart.locator(".recharts-tooltip-wrapper").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).visibility !== "visible"))).toBe(true);
    if (["mismatched-labels", "one-panel", "five-panels", "duplicate-panel", "nonfinite"].includes(edge)) await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty") await expect(edgeChart).toHaveAttribute("data-state", "empty");
    if (edge === "two-panels") await expect(edgeChart.locator("[data-sync-panel]")).toHaveCount(2);
    if (edge === "four-panels") await expect(edgeChart.locator("[data-sync-panel]")).toHaveCount(4);
    if (edge === "missing") {
      for (const panel of ["revenue", "margin", "nps"]) await expect(edgeChart.locator(`[data-sync-panel="${panel}"] [data-sync-dot]`)).toHaveCount(3);
      await expect(edgeChart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "long-labels") await expect(edgeChart.getByRole("table")).toContainText("First enterprise reporting interval");
    await expect(edgeChart).toHaveScreenshot(`T12-${edge}-mobile.png`, { animations: "disabled" });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T12&theme=${system}&capture`);
    const thumb = page.locator('[data-chart-id="T12"]');
    await thumb.evaluate((node) => { const element = node as HTMLElement; element.style.width = "960px"; element.style.height = "624px"; element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    const box = await thumb.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(thumb).toHaveScreenshot(`T12-${system}-thumbnail-25pct.png`, { animations: "disabled" });
  }
  expect(problems).toEqual([]);
});
