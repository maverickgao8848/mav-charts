import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("C04 renders honest positive and signed stacks across systems and layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C04&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C04"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Stacked columns interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator("[data-stacked-bar]")).toHaveCount(6);
      await expect(chart.locator("[data-stack-total]")).toHaveCount(3);

      for (const label of ["Momentum", "Adoption", "Retention"]) {
        const baseBox = await chart.locator(`[data-stacked-bar="${label}:value"] rect`).boundingBox();
        const upperBox = await chart.locator(`[data-stacked-bar="${label}:comparison"] rect`).boundingBox();
        expect(baseBox).not.toBeNull();
        expect(upperBox).not.toBeNull();
        expect(Math.abs((baseBox?.x ?? 0) - (upperBox?.x ?? 0))).toBeLessThanOrEqual(0.5);
        expect(Math.abs((baseBox?.width ?? 0) - (upperBox?.width ?? 0))).toBeLessThanOrEqual(0.5);
        expect(Math.abs((upperBox?.y ?? 0) + (upperBox?.height ?? 0) - (baseBox?.y ?? 0))).toBeLessThanOrEqual(0.75);
      }

      if (system === "signal") {
        const base = chart.locator('[data-series="value"] rect');
        await expect(base.nth(0)).toHaveAttribute("fill", "#ff0000");
        await expect(base.nth(1)).toHaveAttribute("fill", "#f7f7f2");
        await expect(base.nth(2)).toHaveAttribute("fill", "#f7f7f2");
        for (const upper of await chart.locator('[data-series="comparison"] rect').all()) await expect(upper).toHaveAttribute("fill", "#8f1712");
      }
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="C04"]').analyze();
        expect(accessibility.violations, `${system} must pass browser axe including color contrast`).toEqual([]);
      }
      if (layout === "mobile") {
        const legendBox = await chart.locator("[data-stacked-legend]").boundingBox();
        const plotBox = await chart.locator(".recharts-cartesian-grid").boundingBox();
        const directBoxes = await chart.locator("[data-segment-label], [data-stack-total]").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map(({ left, right, top, bottom }) => ({ left, right, top, bottom })));
        expect(legendBox).not.toBeNull();
        expect(plotBox).not.toBeNull();
        expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
        expect(directBoxes.every((box) => box.top >= (legendBox?.y ?? 0) + (legendBox?.height ?? 0))).toBe(true);
        for (let first = 0; first < directBoxes.length; first += 1) for (let second = first + 1; second < directBoxes.length; second += 1) {
          const a = directBoxes[first]; const b = directBoxes[second];
          const overlap = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
          expect(overlap).toBe(false);
        }
      }
      await expect(chart).toHaveScreenshot(`C04-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=C04&theme=signal");
  await expect(page.locator('[data-chart-id="C04"] [data-mav-entry="stacked-column"]')).toHaveCount(6);
  await page.locator('[data-chart-id="C04"] [data-series="value"] rect').first().hover();
  await expect(page.getByText("Core: 64", { exact: true })).toBeVisible();
  await expect(page.getByText("Expansion: 36", { exact: true })).toBeVisible();
  await expect(page.getByText("Total: 100", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", { name: "Stacked columns interactive chart" });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText("Retention: Core 72; Expansion 28; total 100");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C04&theme=signal");
  await expect(page.locator('[data-chart-id="C04"] [data-mav-entry="stacked-column"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["empty", "single", "missing-value", "missing-comparison", "negative", "extreme", "long-label", "flat-zero"] as const) {
    const theme = edgeCase === "negative" ? "signal" : edgeCase === "long-label" ? "editorial" : "digital";
    await page.goto(`/?template=C04&theme=${theme}&case=${edgeCase}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C04"]');
    if (edgeCase === "missing-value" || edgeCase === "missing-comparison") {
      await expect(chart.locator("[data-stacked-bar]")).toHaveCount(5);
      await expect(chart.locator("[data-stack-total]").first()).toContainText("Visible");
    }
    await expect(chart).toHaveScreenshot(`C04-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  await page.goto("/?template=C04&theme=digital&case=invalid&capture");
  await expect(page.locator('[data-chart-id="C04"]')).toHaveAttribute("data-state", "invalid");

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=C04&theme=${system}&capture`);
    await page.mouse.move(0, 0);
    await page.evaluate(() => document.fonts.ready);
    const chart = page.locator('[data-chart-id="C04"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`C04-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
