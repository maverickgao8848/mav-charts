import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C03 renders honest grouped columns across systems and layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C03&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C03"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Grouped columns interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator("[data-grouped-bar]" )).toHaveCount(6);

      const groupBoxes = await chart.locator("[data-grouped-bar]").evaluateAll((nodes) => nodes.map((node) => {
        const rect = node.querySelector("rect")?.getBoundingClientRect();
        return rect ? { key: node.getAttribute("data-grouped-bar"), left: rect.left, right: rect.right } : null;
      }));
      for (const label of ["Momentum", "Adoption", "Retention"]) {
        const pair = groupBoxes.filter((box) => box?.key?.startsWith(`${label}:`)) as { left: number; right: number }[];
        expect(pair).toHaveLength(2);
        expect(pair[0].right).toBeLessThanOrEqual(pair[1].left + 0.5);
      }

      if (system === "signal") {
        const primary = chart.locator('[data-series="value"] rect');
        await expect(primary).toHaveCount(3);
        await expect(primary.nth(0)).toHaveAttribute("fill", "#ff0000");
        await expect(primary.nth(1)).toHaveAttribute("fill", "#f7f7f2");
        await expect(primary.nth(2)).toHaveAttribute("fill", "#f7f7f2");
        for (const comparison of await chart.locator('[data-series="comparison"] rect').all()) await expect(comparison).toHaveAttribute("fill", "#8f1712");
      }
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C03"]').analyze();
        expect(accessibility.violations, `${system} must pass browser axe including color contrast`).toEqual([]);
      }
      if (layout === "mobile") {
        const legendBox = await chart.locator("[data-grouped-legend]").boundingBox();
        const plotBox = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(legendBox).not.toBeNull();
        expect(plotBox).not.toBeNull();
        expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
      }
      await expect(chart).toHaveScreenshot(`C03-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=C03&theme=signal");
  await expect(page.locator('[data-chart-id="C03"] [data-mav-entry="grouped-column"]')).toHaveCount(6);
  await page.locator('[data-chart-id="C03"] [data-series="value"] rect').first().hover();
  await expect(page.getByText("Current: 84", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", { name: "Grouped columns interactive chart" });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText("Retention: Current 57; Prior 71");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C03&theme=signal");
  await expect(page.locator('[data-chart-id="C03"] [data-mav-entry="grouped-column"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["empty", "single", "missing-primary", "missing-comparison", "negative", "extreme", "long-label", "flat-zero"] as const) {
    const theme = edgeCase === "negative" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital";
    await page.goto(`/?template=C03&theme=${theme}&case=${edgeCase}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[data-chart-id="C03"]')).toHaveScreenshot(`C03-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C03&theme=digital&case=invalid&capture");
  await expect(page.locator('[data-chart-id="C03"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C03&theme=${system}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C03"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`C03-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
