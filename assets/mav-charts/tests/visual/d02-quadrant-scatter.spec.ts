import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;
const inside = (
  inner: { x: number; y: number; width: number; height: number },
  outer: { x: number; y: number; width: number; height: number },
) =>
  inner.x >= outer.x - 1 &&
  inner.y >= outer.y - 1 &&
  inner.x + inner.width <= outer.x + outer.width + 1 &&
  inner.y + inner.height <= outer.y + outer.height + 1;
const overlaps = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

test("D02 places true points against explicit quadrant thresholds", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(180_000);
  test.skip(info.project.name !== "desktop", "desktop owns matrix");
  const problems: string[] = [];
  const watch = (p: typeof page, prefix = "") => {
    p.on("console", (m) => {
      if (["error", "warning"].includes(m.type()))
        problems.push(`${prefix}${m.text()}`);
    });
    p.on("pageerror", (e) => problems.push(`${prefix}${e.message}`));
  };
  watch(page);
  for (const [layout, viewport] of Object.entries(layouts))
    for (const system of systems) {
      await page.setViewportSize(viewport);
      await page.goto(`/?template=D02&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D02"]'),
        group = chart.getByRole("group", {
          name: "Quadrant scatter interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-quadrant-animation", "false");
      await expect(group).toHaveAttribute("data-threshold-x", "50");
      await expect(group).toHaveAttribute("data-threshold-y", "50");
      expect(
        Number(await group.getAttribute("data-x-domain-min")),
      ).toBeLessThan(31);
      expect(
        Number(await group.getAttribute("data-x-domain-max")),
      ).toBeGreaterThan(72);
      expect(
        Number(await group.getAttribute("data-y-domain-min")),
      ).toBeLessThan(24);
      expect(
        Number(await group.getAttribute("data-y-domain-max")),
      ).toBeGreaterThan(81);
      await expect(chart.locator(".recharts-reference-line-line")).toHaveCount(
        2,
      );
      await expect(chart.locator("[data-quadrant-point]")).toHaveCount(4);
      const plotBox = await chart.locator(".recharts-cartesian-grid").boundingBox();
      const chartBox = await chart.boundingBox();
      for (const point of await chart.locator("[data-quadrant-point] circle").all()) {
        const box = await point.boundingBox();
        expect(box && plotBox && inside(box, plotBox)).toBe(true);
      }
      for (const label of await chart.locator("[data-quadrant-label]").all()) {
        const box = await label.boundingBox();
        expect(box && chartBox && inside(box, chartBox)).toBe(true);
      }
      await expect(
        chart.locator('[data-quadrant-point="Nova"]'),
      ).toHaveAttribute("data-true-x", "72");
      await expect(
        chart.locator('[data-quadrant-point="Nova"]'),
      ).toHaveAttribute("data-true-y", "81");
      await expect(
        chart.locator('[data-quadrant-point="Nova"] circle'),
      ).toHaveAttribute("fill", system === "signal" ? "#ff0000" : /.+/);
      if (system === "signal")
        await expect(
          chart.locator('[data-quadrant-point="MAV"] circle'),
        ).toHaveAttribute("fill", "#ffffff");
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="D02"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("TWO MEASURES · EXPLICIT THRESHOLDS", { exact: true })
            .boundingBox(),
          legend = await chart.locator("[data-quadrant-legend]").boundingBox(),
          plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await page.mouse.move(0, 0);
      await expect(chart).toHaveScreenshot(`D02-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D02&theme=signal");
  await expect(page.locator('[data-mav-entry="quadrant-scatter"]')).toHaveCount(
    4,
  );
  await page.locator('[data-quadrant-point="Nova"] circle').hover();
  await expect(page.getByText("Reach: 72", { exact: true })).toBeVisible();
  await expect(page.getByText("Momentum: 81", { exact: true })).toBeVisible();
  await expect(
    page.locator(".recharts-tooltip-wrapper small", {
      hasText: "Upper right",
    }),
  ).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Quadrant scatter interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Core: Reach 31; Momentum 24; Lower left",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D02&theme=signal");
  await expect(page.locator('[data-mav-entry="quadrant-scatter"]')).toHaveCount(
    0,
  );
  for (const edge of [
    "empty",
    "single",
    "each-quadrant",
    "boundary",
    "missing",
    "negative",
    "constant",
    "extreme",
    "overlap",
    "long-label",
    "invalid",
    "duplicate",
    "nonfinite",
    "invalid-threshold",
  ] as const) {
    const ep = await browser.newPage({ viewport: layouts.mobile });
    watch(ep, `${edge}:`);
    const system = ["boundary", "overlap"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await ep.goto(`/?template=D02&theme=${system}&case=${edge}&capture`);
    await ep.evaluate(() => document.fonts.ready);
    await ep.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await ep.mouse.move(0, 0);
    const chart = ep.locator('[data-chart-id="D02"]'),
      title = chart.getByRole("heading", {
        name: "Nova leads both dimensions",
      }),
      subtitle = chart.getByText("TWO MEASURES · EXPLICIT THRESHOLDS", {
        exact: true,
      }),
      footer = chart.locator("footer");
    for (const element of [title, subtitle, footer]) {
      await expect(element).toBeVisible();
      const box = await element.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(120);
      expect(box?.height ?? 0).toBeGreaterThan(6);
      const style = await element.evaluate((n) => {
        const c = getComputedStyle(n);
        return {
          display: c.display,
          visibility: c.visibility,
          opacity: Number(c.opacity),
          color: c.color,
        };
      });
      expect(style.display).not.toBe("none");
      expect(style.visibility).toBe("visible");
      expect(style.opacity).toBeGreaterThanOrEqual(0.99);
      expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
    }
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1200);
    expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
    expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    if (
      ["invalid", "duplicate", "nonfinite", "invalid-threshold"].includes(edge)
    )
      await expect(chart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(chart).toHaveAttribute("data-state", "empty");
    else {
      await expect(chart).toHaveAttribute("data-state", "ready");
      const legend = chart.locator("[data-quadrant-legend]");
      await expect(legend).toBeVisible();
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(600);
    }
    const group = chart.getByRole("group", {
      name: "Quadrant scatter interactive chart",
    });
    if (edge === "each-quadrant")
      for (const quadrant of [
        "upper-right",
        "upper-left",
        "lower-left",
        "lower-right",
      ])
        await expect(
          chart.locator(`[data-quadrant="${quadrant}"]`),
        ).toHaveCount(1);
    if (edge === "boundary") {
      await expect(chart.locator('[data-quadrant="boundary"]')).toHaveCount(3);
      await expect(chart.getByRole("table")).toContainText("On boundary");
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-visible-points", "1");
      await expect(chart.getByRole("table")).toContainText(
        "Missing whole point",
      );
    }
    if (edge === "constant")
      expect(
        Number(await group.getAttribute("data-x-domain-min")),
      ).toBeGreaterThan(0);
      if (edge === "overlap") {
      const points = await chart
        .locator("[data-quadrant-point]")
        .evaluateAll((ns) =>
          ns.map((n) => [
            n.getAttribute("data-true-x"),
            n.getAttribute("data-true-y"),
          ]),
        );
      expect(points).toContainEqual(["68", "72"]);
      const labels = await chart
        .locator("[data-quadrant-label]")
        .evaluateAll((ns) =>
          ns.map((n) => ({ x: n.getAttribute("x"), y: n.getAttribute("y") })),
        );
        expect(new Set(labels.map((p) => `${p.x},${p.y}`)).size).toBeGreaterThan(
          1,
        );
        const boxes = await chart.locator("[data-quadrant-label]").evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = (node as SVGGraphicsElement).getBoundingClientRect();
            return { x: box.x, y: box.y, width: box.width, height: box.height };
          }),
        );
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++)
            expect(overlaps(boxes[i], boxes[j])).toBe(false);
      }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "North American enterprise platform accounts",
      );
    expect(
      await chart
        .locator(".recharts-tooltip-wrapper")
        .evaluateAll((ns) =>
          ns.every((n) => getComputedStyle(n).visibility !== "visible"),
        ),
    ).toBe(true);
    await expect(chart).toHaveScreenshot(`D02-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await ep.close();
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=D02&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="D02"]');
    await chart.evaluate((n) => {
      const e = n as HTMLElement;
      e.style.width = "960px";
      e.style.height = "624px";
      e.style.transform = "scale(.25)";
      e.style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(chart).toHaveScreenshot(`D02-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
