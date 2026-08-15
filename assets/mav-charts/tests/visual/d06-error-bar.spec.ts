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
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) =>
  a.x >= b.x - 1 &&
  a.y >= b.y - 1 &&
  a.x + a.width <= b.x + b.width + 1 &&
  a.y + a.height <= b.y + b.height + 1;

test("D06 renders estimates at honest absolute lower and upper bounds", async ({
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
      await page.goto(`/?template=D06&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="D06"]'),
        group = chart.getByRole("group", {
          name: "Error bar interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-error-animation", "false");
      await expect(group).toHaveAttribute("data-visible-estimates", "4");
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        31,
      );
      expect(
        Number(await group.getAttribute("data-domain-min")),
      ).toBeGreaterThan(0);
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(84);
      await expect(chart.locator(".recharts-errorBar")).toHaveCount(4);
      for (const whisker of await chart.locator(".recharts-errorBar").all())
        await expect(whisker.locator("line")).toHaveCount(3);
      const focusPoint = chart.locator('[data-error-point="North"]'),
        focusBar = chart.locator(".recharts-errorBar").last();
      await expect(focusPoint).toHaveAttribute("data-estimate", "72");
      await expect(focusPoint).toHaveAttribute("data-lower", "61");
      await expect(focusPoint).toHaveAttribute("data-upper", "84");
      await expect(focusBar).toHaveCount(1);
      const lines = await focusBar
        .locator("line")
        .evaluateAll((ns) =>
          ns.map((n) => ({
            y1: Number(n.getAttribute("y1")),
            y2: Number(n.getAttribute("y2")),
          })),
        );
      expect(lines[0].y1).toBeCloseTo(lines[1].y2, 3);
      expect(lines[2].y1).toBeCloseTo(lines[1].y1, 3);
      const marker = await focusPoint.locator("circle").boundingBox(),
        plot = await chart.locator(".recharts-cartesian-grid").boundingBox(),
        label = await chart
          .locator('[data-error-estimate="North"]')
          .boundingBox(),
        chartBox = await chart.boundingBox();
      expect(marker && plot && inside(marker, plot)).toBe(true);
      expect(label && chartBox && inside(label, chartBox)).toBe(true);
      if (system === "signal") {
        expect(
          await focusBar.evaluate((node) => getComputedStyle(node).stroke),
        ).toBe("rgb(255, 0, 0)");
        await expect(focusPoint.locator("circle")).toHaveAttribute(
          "fill",
          "#ff0000",
        );
        await expect(
          chart.locator('[data-error-point="South"] circle'),
        ).toHaveAttribute("fill", "#ffffff");
        await expect(chart.locator("[data-error-legend]")).toContainText(
          "ABSOLUTE LOWER / UPPER",
        );
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="D06"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("ESTIMATE · ABSOLUTE LOWER / UPPER", { exact: true })
            .boundingBox(),
          legend = await chart.locator("[data-error-legend]").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await page.mouse.move(0, 0);
      await expect(chart).toHaveScreenshot(`D06-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=D06&theme=signal");
  await expect(page.locator('[data-mav-entry="error-bar"]')).toHaveCount(4);
  await page.locator('[data-error-point="North"] circle').hover();
  await expect(page.getByText("Estimate: 72", { exact: true })).toBeVisible();
  await expect(page.getByText("Lower: 61", { exact: true })).toBeVisible();
  await expect(page.getByText("Upper: 84", { exact: true })).toBeVisible();
  await expect(page.getByText("−11 / +12", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Error bar interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "West: Estimate 41; lower 31; upper 54; −10 / +13",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=D06&theme=signal");
  await expect(page.locator('[data-mav-entry="error-bar"]')).toHaveCount(0);
  for (const edge of [
    "empty",
    "single",
    "missing",
    "negative",
    "asymmetric",
    "zero-error",
    "constant",
    "extreme",
    "long-label",
    "invalid-order",
    "partial-missing",
    "invalid",
    "duplicate",
    "nonfinite",
  ] as const) {
    const ep = await browser.newPage({ viewport: layouts.mobile });
    watch(ep, `${edge}:`);
    const system = ["missing", "asymmetric"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await ep.goto(`/?template=D06&theme=${system}&case=${edge}&capture`);
    await ep.evaluate(() => document.fonts.ready);
    await ep.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await ep.mouse.move(0, 0);
    const chart = ep.locator('[data-chart-id="D06"]'),
      title = chart.getByRole("heading", {
        name: "North leads despite wider uncertainty",
      }),
      subtitle = chart.getByText("ESTIMATE · ABSOLUTE LOWER / UPPER", {
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
      [
        "invalid-order",
        "partial-missing",
        "invalid",
        "duplicate",
        "nonfinite",
      ].includes(edge)
    )
      await expect(chart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(chart).toHaveAttribute("data-state", "empty");
    else {
      await expect(chart).toHaveAttribute("data-state", "ready");
      const legend = chart.locator("[data-error-legend]");
      await expect(legend).toBeVisible();
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(600);
    }
    const group = chart.getByRole("group", {
      name: "Error bar interactive chart",
    });
    if (edge === "single") {
      await expect(group).toHaveAttribute("data-visible-estimates", "1");
      await expect(chart.locator(".recharts-errorBar")).toHaveCount(1);
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-visible-estimates", "2");
      await expect(chart.locator('[data-error-point="Pending"]')).toHaveCount(
        0,
      );
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "negative")
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        0,
      );
    if (edge === "asymmetric") {
      await expect(
        chart.locator('[data-error-point="Skewed low"]'),
      ).toHaveAttribute("data-lower", "20");
      await expect(
        chart.locator('[data-error-point="Skewed low"]'),
      ).toHaveAttribute("data-upper", "58");
    }
    if (edge === "zero-error") {
      const lines = await chart
        .locator(".recharts-errorBar")
        .first()
        .locator("line")
        .evaluateAll((ns) => ns.map((n) => Number(n.getAttribute("y1"))));
      expect(new Set(lines).size).toBe(1);
    }
    if (edge === "constant") {
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        8,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(12);
    }
    if (edge === "extreme")
      await expect(chart.getByRole("table")).toContainText("1800000000");
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "North American enterprise confidence interval",
      );
    expect(
      await chart
        .locator(".recharts-tooltip-wrapper")
        .evaluateAll((ns) =>
          ns.every((n) => getComputedStyle(n).visibility !== "visible"),
        ),
    ).toBe(true);
    await expect(chart).toHaveScreenshot(`D06-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await ep.close();
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=D06&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="D06"]');
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
    await expect(chart).toHaveScreenshot(`D06-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
