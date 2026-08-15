import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const,
  layouts = {
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
test("T08 preserves an absolute complete-only stack", async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(
    testInfo.project.name !== "desktop",
    "One desktop project owns the responsive matrix",
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
      await page.goto(`/?template=T08&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T08"]'),
        group = chart.getByRole("group", {
          name: "Stacked area interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-stack-id", "absolute-total");
      await expect(group).toHaveAttribute("data-normalized", "false");
      await expect(group).toHaveAttribute("data-domain-min", "0");
      await expect(group).toHaveAttribute(
        "data-stacked-area-animation",
        "false",
      );
      await expect(
        chart.locator('[data-mav-entry="stacked-area"]'),
      ).toHaveCount(0);
      await expect(chart.locator('[data-series="base"]')).toHaveCount(4);
      await expect(chart.locator('[data-series="upper"]')).toHaveCount(4);
      const base = await chart
          .locator('[data-series="base"]')
          .evaluateAll((ns) =>
            ns.map((n) => ({
              x: Number(n.getAttribute("cx")),
              y: Number(n.getAttribute("cy")),
            })),
          ),
        upper = await chart.locator('[data-series="upper"]').evaluateAll((ns) =>
          ns.map((n) => ({
            x: Number(n.getAttribute("cx")),
            y: Number(n.getAttribute("cy")),
          })),
        );
      for (let i = 0; i < 4; i++) {
        expect(upper[i].x).toBeCloseTo(base[i].x, 3);
        expect(upper[i].y).toBeLessThan(base[i].y);
      }
      const label = await chart
          .locator("[data-stack-area-latest]")
          .boundingBox(),
        plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
      expect(label && plot && inside(label, plot)).toBe(true);
      if (system === "signal") {
        await expect(
          chart.locator(".recharts-area-curve").nth(0),
        ).toHaveAttribute("stroke", "#ff0000");
        await expect(
          chart.locator(".recharts-area-curve").nth(1),
        ).toHaveAttribute("stroke", "#8f1712");
        await expect(chart.locator("[data-stacked-area-legend]")).toContainText(
          "STACKED ABSOLUTE · NOT NORMALIZED",
        );
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="T08"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("TWO PARTS · STACKED ABSOLUTE · RAW UNITS", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart
            .locator("[data-stacked-area-legend]")
            .boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await expect(chart).toHaveScreenshot(`T08-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T08&theme=signal");
  await expect(page.locator('[data-mav-entry="stacked-area"]')).toHaveCount(8);
  await page.locator('[data-series="upper"][data-stack-area-dot="Q2"]').hover();
  await expect(page.getByText("Core: 46", { exact: true })).toBeVisible();
  await expect(page.getByText("Expansion: 31", { exact: true })).toBeVisible();
  await expect(page.getByText("Total: 77", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Stacked area interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Q4: Core 69; Expansion 42; total 111",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T08&theme=signal");
  await expect(page.locator('[data-mav-entry="stacked-area"]')).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Stacked area interactive chart" }),
  ).toHaveAttribute("data-stacked-area-animation", "false");
  for (const edge of [
    "empty",
    "single",
    "missing-value",
    "missing-comparison",
    "zero",
    "constant",
    "arbitrary",
    "extreme",
    "long-label",
    "invalid-negative",
    "duplicate",
    "nonfinite",
  ] as const) {
    const edgePage = await browser.newPage({ viewport: layouts.mobile });
    watch(edgePage);
    const system = ["missing-value", "arbitrary"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await edgePage.goto(`/?template=T08&theme=${system}&case=${edge}&capture`);
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await edgePage.mouse.move(0, 0);
    const chart = edgePage.locator('[data-chart-id="T08"]');
    const title = chart.getByText("Expansion lifted the absolute total", {
      exact: true,
    });
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS("color", "rgb(255, 255, 255)");
    expect(
      await chart
        .locator(".recharts-tooltip-wrapper")
        .evaluateAll((ns) =>
          ns.every((n) => getComputedStyle(n).visibility !== "visible"),
        ),
    ).toBe(true);
    if (["invalid-negative", "duplicate", "nonfinite"].includes(edge))
      await expect(chart).toHaveAttribute("data-state", "invalid");
    if (edge === "empty")
      await expect(chart).toHaveAttribute("data-state", "empty");
    if (edge === "single") {
      await expect(chart.locator('[data-series="base"]')).toHaveCount(1);
      await expect(chart.locator("[data-stack-area-latest]")).toContainText(
        "Σ 40 · 24 + 16",
      );
    }
    if (edge === "missing-value" || edge === "missing-comparison") {
      const group = chart.getByRole("group", {
        name: "Stacked area interactive chart",
      });
      await expect(group).toHaveAttribute("data-complete-segments", "2");
      await expect(chart.locator('[data-stack-area-dot="Mar"]')).toHaveCount(0);
      const paths = await chart
        .locator(".recharts-area-curve")
        .evaluateAll((ns) => ns.map((n) => n.getAttribute("d") ?? ""));
      expect((paths[0].match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((paths[1].match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      await expect(chart.getByRole("table")).toContainText(
        "Missing whole total",
      );
    }
    if (edge === "arbitrary") {
      await expect(chart.getByRole("table")).toContainText("120");
      await expect(
        chart.getByRole("group", { name: "Stacked area interactive chart" }),
      ).toHaveAttribute("data-domain-max", "132");
      await expect(chart.locator("[data-stack-area-latest]")).toContainText(
        "Σ 13 · 5 + 8",
      );
    }
    if (edge === "zero")
      await expect(chart).toHaveAttribute("data-state", "ready");
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "First enterprise reporting interval",
      );
    const latest = chart.locator("[data-stack-area-latest]");
    if ((await latest.count()) > 0) {
      const label = await latest.boundingBox(),
        plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
      if (label && plot) expect(inside(label, plot)).toBe(true);
    }
    await expect(chart).toHaveScreenshot(`T08-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await edgePage.close();
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T08&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T08"]');
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
    await expect(chart).toHaveScreenshot(`T08-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
