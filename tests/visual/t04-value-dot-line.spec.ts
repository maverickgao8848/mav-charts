import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

const overlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

test("T04 labels every finite value without corrupting gaps or mobile geometry", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One desktop project owns the full responsive matrix");
  const browserProblems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) browserProblems.push(message.text());
  });
  page.on("pageerror", (error) => browserProblems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=T04&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T04"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.getByRole("group", { name: "Value dot line interactive chart" })).toHaveAttribute("data-value-dot-animation", "false");
      await expect(chart.locator('[data-mav-entry="value-dot-line"]')).toHaveCount(0);
      await expect(chart.locator("[data-value-dot]")).toHaveCount(4);
      await expect(chart.locator("[data-value-label]")).toHaveCount(4);
      const positions = await chart.locator("[data-value-dot]").evaluateAll((nodes) => nodes.map((node) => ({ x: Number(node.getAttribute("cx")), y: Number(node.getAttribute("cy")) })));
      expect(positions[1].x - positions[0].x).toBeCloseTo(positions[2].x - positions[1].x, 3);
      expect(positions[2].x - positions[1].x).toBeCloseTo(positions[3].x - positions[2].x, 3);
      const labelBoxes = (await chart.locator("[data-value-label]").evaluateAll((nodes) => nodes.map((node) => {
        const box = (node as SVGGraphicsElement).getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }))).filter((box) => box.width > 0);
      for (let i = 0; i < labelBoxes.length; i += 1)
        for (let j = i + 1; j < labelBoxes.length; j += 1)
          expect(overlap(labelBoxes[i], labelBoxes[j])).toBe(false);
      if (layout === "wide") {
        expect((await new AxeBuilder({ page }).include('[data-chart-id="T04"]').analyze()).violations).toEqual([]);
      }
      if (system === "signal") {
        await expect(chart.locator(".recharts-line-curve")).toHaveAttribute("stroke", "#ff0000");
        for (const dot of await chart.locator("[data-value-dot]").all()) {
          await expect(dot).toHaveAttribute("fill", "#ff0000");
          await expect(dot).toHaveAttribute("r", "7");
        }
      }
      if (layout === "mobile") {
        const subtitle = await chart.getByText("ONE METRIC · DIRECT VALUES · EQUAL SPACING", { exact: true }).boundingBox();
        const legend = await chart.locator("[data-value-dot-legend]").boundingBox();
        const plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect((subtitle?.y ?? 0) + (subtitle?.height ?? 0)).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual((plot?.y ?? 0) + 1);
      }
      await page.mouse.move(0, 0);
      await expect(chart).toHaveScreenshot(`T04-${system}-${layout}.png`, { animations: "disabled" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T04&theme=signal");
  await expect(page.locator('[data-mav-entry="value-dot-line"]')).toHaveCount(4);
  await page.locator('[data-value-dot="Week 2"]').hover();
  await expect(page.getByText("Value: 143", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", { name: "Value dot line interactive chart" });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText("Week 4: Value 173");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T04&theme=signal");
  await expect(page.locator('[data-mav-entry="value-dot-line"]')).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Value dot line interactive chart" })).toHaveAttribute("data-value-dot-animation", "false");

  for (const edge of ["empty", "single", "missing", "leading-gap", "trailing-gap", "negative", "constant", "near-collision", "extreme", "long-label", "invalid", "duplicate", "nonfinite"] as const) {
    const theme = edge === "long-label" ? "editorial" : ["missing", "near-collision"].includes(edge) ? "signal" : "digital";
    // Give each edge an independent page/compositor. Rapid query-only navigation on
    // Windows Chromium can retain an obsolete transparent HTML layer in locator PNGs.
    const edgePage = await page.context().newPage();
    edgePage.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) browserProblems.push(`${edge}: ${message.text()}`);
    });
    edgePage.on("pageerror", (error) => browserProblems.push(`${edge}: ${error.message}`));
    await edgePage.setViewportSize(layouts.mobile);
    await edgePage.goto(`/?template=T04&theme=${theme}&case=${edge}&capture`);
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.evaluate(() => window.scrollTo(0, 0));
    await edgePage.mouse.move(0, 0);
    const chart = edgePage.locator('[data-chart-id="T04"]');
    await expect(chart).toBeVisible();
    if (["invalid", "duplicate", "nonfinite"].includes(edge)) await expect(chart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty") await expect(chart).toHaveAttribute("data-state", "empty");
    if (!["empty", "invalid", "duplicate", "nonfinite"].includes(edge)) {
      await expect(chart).toHaveAttribute("data-state", "ready");
      const title = chart.getByRole("heading", { name: "Every observation is labelled, not estimated" });
      const subtitle = chart.getByText("ONE METRIC · DIRECT VALUES · EQUAL SPACING", { exact: true });
      const legend = chart.locator("[data-value-dot-legend]");
      await expect(title).toBeVisible();
      await expect(subtitle).toBeVisible();
      await expect(legend).toBeVisible();
      const subtitleBox = await subtitle.boundingBox();
      const legendBox = await legend.boundingBox();
      const plotBox = await chart.locator(".recharts-cartesian-grid").boundingBox();
      const titleBox = await title.boundingBox();
      expect(titleBox?.width ?? 0).toBeGreaterThan(180);
      expect(titleBox?.height ?? 0).toBeGreaterThan(45);
      expect(subtitleBox?.width ?? 0).toBeGreaterThan(150);
      expect(legendBox?.width ?? 0).toBeGreaterThan(150);
      for (const element of [title, subtitle, legend]) {
        const style = await element.evaluate((node) => {
          const computed = getComputedStyle(node);
          return {
            color: computed.color,
            display: computed.display,
            opacity: Number(computed.opacity),
            visibility: computed.visibility,
          };
        });
        expect(style.display).not.toBe("none");
        expect(style.visibility).toBe("visible");
        expect(style.opacity).toBeGreaterThanOrEqual(0.99);
        expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
      }
      // Element PNG sizes are a pixel-level guard: a transparent/empty capture is only a few hundred bytes.
      expect((await title.screenshot()).byteLength).toBeGreaterThan(1_500);
      expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(700);
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(700);
      expect((subtitleBox?.y ?? 0) + (subtitleBox?.height ?? 0)).toBeLessThanOrEqual((legendBox?.y ?? 0) + 1);
      expect((legendBox?.y ?? 0) + (legendBox?.height ?? 0)).toBeLessThanOrEqual((plotBox?.y ?? 0) + 1);
    }
    if (edge === "single") {
      await expect(chart.locator("[data-value-dot]")).toHaveCount(1);
      await expect(chart.locator("[data-value-label]")).toHaveText("24");
    }
    if (edge === "missing") {
      await expect(chart.locator("[data-value-dot]")).toHaveCount(3);
      await expect(chart.locator("[data-value-label]")).toHaveCount(3);
      const path = await chart.locator(".recharts-line-curve").getAttribute("d");
      expect((path?.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      await expect(chart.getByRole("table")).toContainText("Feb");
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "leading-gap") await expect(chart.locator("[data-value-dot]").first()).toHaveAttribute("data-value-dot", "First report");
    if (edge === "trailing-gap") await expect(chart.locator("[data-value-label]")).toHaveCount(2);
    if (edge === "long-label") await expect(chart.getByRole("table")).toContainText("First enterprise reporting interval");
    if (["constant", "near-collision"].includes(edge)) {
      const labels = (await chart.locator("[data-value-label]").evaluateAll((nodes) => nodes.map((node) => {
        const box = (node as SVGGraphicsElement).getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }))).filter((box) => box.width > 0);
      for (let i = 0; i < labels.length; i += 1)
        for (let j = i + 1; j < labels.length; j += 1)
          expect(overlap(labels[i], labels[j])).toBe(false);
    }
    expect(await chart.locator(".recharts-tooltip-wrapper").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).visibility !== "visible"))).toBe(true);
    // Capture mode already removes every animation in CSS and chart props. Let Chromium
    // rasterize normally here; Playwright's animation cancellation intermittently dropped
    // Chiron/HTML header layers after rapid same-page edge navigations on Windows.
    await expect(chart).toHaveScreenshot(`T04-${edge}-mobile.png`, { animations: "allow" });
    await edgePage.close();
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T04&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T04"]');
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
    await expect(chart).toHaveScreenshot(`T04-${system}-thumbnail-25pct.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
