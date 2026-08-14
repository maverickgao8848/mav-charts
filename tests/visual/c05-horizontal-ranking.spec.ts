import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C05 renders stable, signed and accessible rankings across systems and layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C05&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C05"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Horizontal ranking interactive chart" })).toHaveAttribute("data-ranking-animation", "false");
      const bars = chart.locator("[data-ranking-bar]");
      await expect(bars).toHaveCount(3);
      await expect(bars.nth(0)).toHaveAttribute("data-rank", "1");
      await expect(bars.nth(1)).toHaveAttribute("data-rank", "2");
      await expect(bars.nth(2)).toHaveAttribute("data-rank", "3");
      const widths = await bars.locator("rect").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
      expect(widths[0]).toBeGreaterThan(widths[1]);
      expect(widths[1]).toBeGreaterThan(widths[2]);
      if (system === "signal") {
        await expect(bars.nth(0).locator("rect")).toHaveAttribute("fill", "#ff0000");
        await expect(bars.nth(1).locator("rect")).toHaveAttribute("fill", "#f7f7f2");
        await expect(bars.nth(2).locator("rect")).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C05"]').analyze();
        expect(accessibility.violations, `${system} must pass browser axe including color contrast`).toEqual([]);
      }
      if (layout === "mobile") {
        const legendBox = await chart.locator("[data-ranking-legend]").boundingBox();
        const plotBox = await chart.locator(".recharts-cartesian-grid").boundingBox();
        const ticks = await chart.locator("[data-ranking-tick]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map(({ right, top, bottom }) => ({ right, top, bottom })));
        const direct = await chart.locator("[data-ranking-value]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map(({ left, right, top, bottom }) => ({ left, right, top, bottom })));
        expect(legendBox).not.toBeNull();
        expect(plotBox).not.toBeNull();
        expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
        expect(ticks.every((box) => box.right <= (plotBox?.x ?? 0) + 1)).toBe(true);
        expect(direct.every((box) => box.left >= (plotBox?.x ?? 0) - 1 && box.right <= 390)).toBe(true);
      }
      await expect(chart).toHaveScreenshot(`C05-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=C05&theme=signal");
  await expect(page.locator('[data-chart-id="C05"] [data-mav-entry="horizontal-ranking"]')).toHaveCount(3);
  await page.locator('[data-chart-id="C05"] [data-ranking-bar]').first().locator("rect").hover();
  await expect(page.getByText("Rank: 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Value: 173", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", { name: "Horizontal ranking interactive chart" });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText("Rank 3: Partner network; Value 96");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C05&theme=signal");
  await expect(page.locator('[data-chart-id="C05"] [data-mav-entry="horizontal-ranking"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["empty", "single", "missing", "negative", "ties", "extreme", "long-label"] as const) {
    const theme = edgeCase === "negative" || edgeCase === "ties" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital";
    await page.goto(`/?template=C05&theme=${theme}&case=${edgeCase}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C05"]');
    if (edgeCase === "missing") {
      await expect(chart.locator("[data-ranking-bar]")).toHaveCount(2);
      await expect(chart.locator("[data-ranking-tick]")).toHaveCount(3);
      await expect(chart.locator('[data-ranking-tick="Not reported"]')).toContainText("—");
    }
    if (edgeCase === "ties") {
      await expect(chart.locator('[data-ranking-bar][data-rank="1"]')).toHaveCount(2);
      await expect(chart.locator('[data-ranking-bar] rect[fill="#ff0000"]')).toHaveCount(1);
    }
    if (edgeCase === "negative") {
      const zeroLine = chart.locator(".recharts-reference-line-line");
      await expect(zeroLine).toHaveAttribute("stroke", "#a6a6a0");
      expect(Number.isFinite(Number(await zeroLine.getAttribute("x1")))).toBe(true);
      const tickBox = await chart.locator('[data-ranking-tick="Largest decline"]').boundingBox();
      const valueBox = await chart.locator('[data-ranking-bar="Largest decline"] [data-ranking-value]').boundingBox();
      expect(tickBox).not.toBeNull();
      expect(valueBox).not.toBeNull();
      expect((tickBox?.x ?? 0) + (tickBox?.width ?? 0)).toBeLessThanOrEqual((valueBox?.x ?? 0));
    }
    await expect(chart).toHaveScreenshot(`C05-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C05&theme=digital&case=invalid&capture");
  await expect(page.locator('[data-chart-id="C05"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C05&theme=${system}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C05"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`C05-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
