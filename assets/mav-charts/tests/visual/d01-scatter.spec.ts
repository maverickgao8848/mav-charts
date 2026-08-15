import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;
const overlap = (a: DOMRect, b: DOMRect) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
const inside = (a: DOMRect, b: DOMRect) =>
  a.x >= b.x - 1 &&
  a.y >= b.y - 1 &&
  a.x + a.width <= b.x + b.width + 1 &&
  a.y + a.height <= b.y + b.height + 1;

test("D01 maps honest independent scatter coordinates", async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(
    testInfo.project.name !== "desktop",
    "One desktop project owns the matrix",
  );
  const problems: string[] = [];
  const watch = (p: typeof page) => {
    p.on("console", (m) => {
      if (["error", "warning"].includes(m.type())) problems.push(m.text());
    });
    p.on("pageerror", (e) => problems.push(e.message));
  };
  watch(page);
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=D01&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D01"]'),
        group = chart.getByRole("group", { name: "Scatter interactive chart" });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-plotted-count", "4");
      await expect(group).toHaveAttribute("data-missing-count", "0");
      await expect(group).toHaveAttribute("data-scatter-animation", "false");
      await expect(chart.locator('[data-mav-entry="scatter"]')).toHaveCount(0);
      await expect(chart.locator("[data-scatter-point]")).toHaveCount(4);
      const xMin = Number(await group.getAttribute("data-x-domain-min")),
        xMax = Number(await group.getAttribute("data-x-domain-max")),
        yMin = Number(await group.getAttribute("data-y-domain-min")),
        yMax = Number(await group.getAttribute("data-y-domain-max"));
      expect(xMin).toBeLessThan(28);
      expect(xMax).toBeGreaterThan(61);
      expect(yMin).toBeLessThan(42);
      expect(yMax).toBeGreaterThan(68);
      if (system === "signal") {
        await expect(
          chart.locator('[data-scatter-point="Point 1"]'),
        ).toHaveAttribute("fill", "#ff0000");
        for (const label of ["Point 2", "Point 3", "Point 4"])
          await expect(
            chart.locator(`[data-scatter-point="${label}"]`),
          ).toHaveAttribute("fill", "#f7f7f2");
      }
      const plot = await chart
          .locator(".recharts-cartesian-grid")
          .boundingBox(),
        labels = await chart
          .locator("[data-scatter-label]")
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getBoundingClientRect()),
          );
      for (const label of labels)
        if (plot) expect(inside(label as DOMRect, plot as DOMRect)).toBe(true);
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="D01"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("TWO QUANTITATIVE VARIABLES · INDEPENDENT SCALES", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-scatter-legend]").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await expect(chart).toHaveScreenshot(`D01-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D01&theme=signal");
  await expect(page.locator('[data-mav-entry="scatter"]')).toHaveCount(4);
  await page.locator('[data-scatter-point="Point 2"]').hover();
  await expect(page.getByText("X value: 36", { exact: true })).toBeVisible();
  await expect(page.getByText("Y value: 55", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Scatter interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Point 4: X value 61; Y value 59",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D01&theme=signal");
  await expect(page.locator('[data-mav-entry="scatter"]')).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Scatter interactive chart" }),
  ).toHaveAttribute("data-scatter-animation", "false");
  for (const edge of [
    "empty",
    "single",
    "missing",
    "negative",
    "constant",
    "extreme",
    "overlap",
    "long-label",
    "invalid",
    "duplicate",
    "nonfinite",
  ] as const) {
    const edgePage = await browser.newPage({ viewport: layouts.mobile });
    watch(edgePage);
    const system = ["missing", "negative", "constant", "overlap"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await edgePage.goto(`/?template=D01&theme=${system}&case=${edge}&capture`);
    await edgePage.waitForLoadState("networkidle");
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await edgePage.mouse.move(0, 0);
    const chart = edgePage.locator('[data-chart-id="D01"]'),
      title = chart.getByText("The first point anchors the relationship", {
        exact: true,
      }),
      subtitle = chart.getByText(
        "TWO QUANTITATIVE VARIABLES · INDEPENDENT SCALES",
        { exact: true },
      ),
      footer = chart.locator("footer"),
      legend = chart.locator("[data-scatter-legend]");
    for (const element of [title, subtitle, footer])
      await expect(element).toBeVisible();
    await expect(title).toHaveCSS("color", "rgb(255, 255, 255)");
    expect(
      await chart
        .locator(".recharts-tooltip-wrapper")
        .evaluateAll((nodes) =>
          nodes.every(
            (node) => getComputedStyle(node).visibility !== "visible",
          ),
        ),
    ).toBe(true);
    if (["invalid", "duplicate", "nonfinite"].includes(edge))
      await expect(chart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty")
      await expect(chart).toHaveAttribute("data-state", "empty");
    const ready = !["empty", "invalid", "duplicate", "nonfinite"].includes(
      edge,
    );
    if (ready) await expect(legend).toBeVisible();
    const group = chart.getByRole("group", {
      name: "Scatter interactive chart",
    });
    if (edge === "single") {
      await expect(group).toHaveAttribute("data-plotted-count", "1");
      expect(
        Number(await group.getAttribute("data-x-domain-min")),
      ).toBeLessThan(24);
      expect(
        Number(await group.getAttribute("data-x-domain-max")),
      ).toBeGreaterThan(24);
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-plotted-count", "2");
      await expect(group).toHaveAttribute("data-missing-count", "2");
      await expect(chart.locator("[data-scatter-point]")).toHaveCount(2);
      await expect(
        chart.locator('[data-scatter-point="Missing X"]'),
      ).toHaveCount(0);
      await expect(
        chart.locator('[data-scatter-point="Missing Y"]'),
      ).toHaveCount(0);
      await expect(chart.getByRole("table")).toContainText("Missing point");
    }
    if (edge === "negative") {
      expect(
        Number(await group.getAttribute("data-x-domain-min")),
      ).toBeLessThan(-20);
      expect(
        Number(await group.getAttribute("data-x-domain-max")),
      ).toBeGreaterThan(14);
      expect(
        Number(await group.getAttribute("data-y-domain-min")),
      ).toBeLessThan(-16);
      expect(
        Number(await group.getAttribute("data-y-domain-max")),
      ).toBeGreaterThan(12);
    }
    if (edge === "constant") {
      await expect(group).toHaveAttribute("data-x-domain-min", "6");
      await expect(group).toHaveAttribute("data-x-domain-max", "8");
      await expect(group).toHaveAttribute("data-y-domain-min", "8");
      await expect(group).toHaveAttribute("data-y-domain-max", "10");
    }
    if (edge === "overlap") {
      const points = await chart
        .locator("[data-scatter-point]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            cx: node.getAttribute("cx"),
            cy: node.getAttribute("cy"),
          })),
        );
      expect(
        new Set(points.map((point) => `${point.cx}|${point.cy}`)).size,
      ).toBe(1);
      const labels = await chart
        .locator("[data-scatter-label]")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect()),
        );
      for (let i = 0; i < labels.length; i++)
        for (let j = i + 1; j < labels.length; j++)
          expect(overlap(labels[i] as DOMRect, labels[j] as DOMRect)).toBe(
            false,
          );
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "First enterprise reporting cohort",
      );
    if (ready) {
      const plot = await chart
          .locator(".recharts-cartesian-grid")
          .boundingBox(),
        labels = await chart
          .locator("[data-scatter-label]")
          .evaluateAll((nodes) =>
            nodes.map((node) => node.getBoundingClientRect()),
          );
      for (const label of labels)
        if (plot) expect(inside(label as DOMRect, plot as DOMRect)).toBe(true);
    }
    const chartBox = await chart.boundingBox();
    expect(chartBox).not.toBeNull();
    await edgePage.waitForTimeout(250);
    await expect(edgePage).toHaveScreenshot(`D01-${edge}-mobile.png`, {
      animations: "disabled",
      clip: chartBox!,
    });
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1_200);
    expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
    expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    if (ready)
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(500);
    await edgePage.close();
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=D01&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="D01"]');
    await chart.evaluate((node) => {
      const e = node as HTMLElement;
      e.style.width = "960px";
      e.style.height = "624px";
      e.style.transform = "scale(.25)";
      e.style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(chart).toHaveScreenshot(`D01-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
