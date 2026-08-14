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
) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
test("T07 overlays two zero-base areas without stacking", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "One desktop project owns the responsive matrix",
  );
  const problems: string[] = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(e.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=T07&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T07"]'),
        interactive = chart.getByRole("group", {
          name: "Multi-series area interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(interactive).toHaveAttribute("data-base-value", "0");
      await expect(interactive).toHaveAttribute(
        "data-stacking",
        "overlaid-not-stacked",
      );
      await expect(interactive).toHaveAttribute("data-area-animation", "false");
      await expect(
        chart.locator('[data-mav-entry="multi-series-area"]'),
      ).toHaveCount(0);
      await expect(chart.locator('[data-series="value"]')).toHaveCount(4);
      await expect(chart.locator('[data-series="comparison"]')).toHaveCount(4);
      const areas = chart.locator(".recharts-area-area");
      await expect(areas).toHaveCount(2);
      const boxes = await areas.evaluateAll((nodes) =>
        nodes.map((node) => {
          const { x, y, width, height } = node.getBoundingClientRect();
          return { x, y, width, height };
        }),
      );
      expect(overlap(boxes[0], boxes[1])).toBe(true);
      expect(boxes[0].y + boxes[0].height).toBeCloseTo(
        boxes[1].y + boxes[1].height,
        0,
      );
      const labels = await chart
        .locator("[data-area-latest]")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return { x, y, width, height };
          }),
        );
      expect(labels).toHaveLength(2);
      expect(overlap(labels[0], labels[1])).toBe(false);
      const plotBounds = await chart
        .locator(".recharts-cartesian-grid")
        .boundingBox();
      for (const label of labels) {
        expect(label.x).toBeGreaterThanOrEqual((plotBounds?.x ?? 0) - 1);
        expect(label.x + label.width).toBeLessThanOrEqual(
          (plotBounds?.x ?? 0) + (plotBounds?.width ?? 0) + 1,
        );
        expect(label.y).toBeGreaterThanOrEqual((plotBounds?.y ?? 0) - 1);
        expect(label.y + label.height).toBeLessThanOrEqual(
          (plotBounds?.y ?? 0) + (plotBounds?.height ?? 0) + 1,
        );
      }
      if (system === "signal") {
        await expect(
          chart.locator(".recharts-area-curve").nth(0),
        ).toHaveAttribute("stroke", "#f7f7f2");
        await expect(
          chart.locator(".recharts-area-curve").nth(1),
        ).toHaveAttribute("stroke", "#ff0000");
        await expect(chart.locator("[data-area-legend]")).toContainText(
          "OVERLAID · NOT STACKED · BASE 0",
        );
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="T07"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("TWO AREAS · SAME UNIT · OVERLAID FROM ZERO", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-area-legend]").boundingBox(),
          plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await expect(chart).toHaveScreenshot(`T07-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T07&theme=signal");
  await expect(
    page.locator('[data-mav-entry="multi-series-area"]'),
  ).toHaveCount(8);
  await page.locator('[data-series="value"][data-area-dot="Q2"]').hover();
  await expect(page.getByText("Current: 55", { exact: true })).toBeVisible();
  await expect(page.getByText("Prior: 37", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Multi-series area interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Q4: Current 73; Prior 58; overlaid from zero",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T07&theme=signal");
  await expect(
    page.locator('[data-mav-entry="multi-series-area"]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Multi-series area interactive chart" }),
  ).toHaveAttribute("data-area-animation", "false");
  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single",
    "missing-primary",
    "missing-comparison",
    "leading-gap",
    "trailing-gap",
    "negative",
    "mixed",
    "constant",
    "extreme",
    "long-label",
    "invalid",
    "duplicate",
    "nonfinite",
  ] as const) {
    const system = ["missing-primary", "negative", "mixed"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await page.goto(`/?template=T07&theme=${system}&case=${edge}&capture`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const chart = page.locator('[data-chart-id="T07"]');
    await expect(
      chart.getByText("Current scale expanded faster than the prior path", {
        exact: true,
      }),
    ).toBeVisible();
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
    if (edge === "single")
      await expect(chart.locator("[data-area-dot]")).toHaveCount(2);
    if (edge === "missing-primary") {
      const group = chart.getByRole("group", {
        name: "Multi-series area interactive chart",
      });
      await expect(group).toHaveAttribute("data-primary-segments", "2");
      await expect(group).toHaveAttribute("data-comparison-segments", "1");
      const paths = await chart
        .locator(".recharts-area-curve")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("d") ?? ""),
        );
      expect((paths[1].match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((paths[0].match(/M/g) ?? []).length).toBe(1);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "missing-comparison")
      await expect(
        chart.getByRole("group", {
          name: "Multi-series area interactive chart",
        }),
      ).toHaveAttribute("data-comparison-segments", "2");
    if (edge === "negative")
      expect(
        Number(
          await chart
            .getByRole("group", { name: "Multi-series area interactive chart" })
            .getAttribute("data-domain-max"),
        ),
      ).toBe(0);
    if (edge === "mixed") {
      const group = chart.getByRole("group", {
        name: "Multi-series area interactive chart",
      });
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        0,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(0);
    }
    if (edge === "constant") {
      const labels = await chart
        .locator("[data-area-latest]")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return { x, y, width, height };
          }),
        );
      expect(labels).toHaveLength(2);
      expect(overlap(labels[0], labels[1])).toBe(false);
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "First enterprise reporting interval",
      );
    await expect(chart).toHaveScreenshot(`T07-${edge}-mobile.png`, {
      animations: "disabled",
    });
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T07&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T07"]');
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
    await expect(chart).toHaveScreenshot(`T07-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
