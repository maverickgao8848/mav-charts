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

test("T10 preserves caller indexes around event markers", async ({
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
      await page.goto(`/?template=T10&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T10"]'),
        group = chart.getByRole("group", {
          name: "Indexed event trend interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-baseline", "100");
      await expect(group).toHaveAttribute("data-event-count", "1");
      await expect(group).toHaveAttribute("data-indexed-animation", "false");
      await expect(
        chart.locator('[data-mav-entry="indexed-event"]'),
      ).toHaveCount(0);
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        100,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(139);
      await expect(
        chart.locator("svg").getByText("BASELINE 100", { exact: true }),
      ).toBeVisible();
      await expect(
        chart.locator("svg").getByText("Policy launch", { exact: true }),
      ).toBeVisible();
      const curves = chart.locator(".recharts-line-curve");
      await expect(curves).toHaveCount(2);
      if (system === "signal") {
        await expect(curves.nth(0)).toHaveAttribute("stroke", "#ff0000");
        await expect(curves.nth(1)).toHaveAttribute("stroke", "#f7f7f2");
      }
      const labels = await chart
        .locator("[data-indexed-latest]")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect()),
        );
      expect(labels).toHaveLength(2);
      expect(overlap(labels[0] as DOMRect, labels[1] as DOMRect)).toBe(false);
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="T10"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("TWO INDEXED SERIES · BASELINE 100 · EVENT WINDOWS", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-indexed-legend]").boundingBox(),
          plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await expect(chart).toHaveScreenshot(`T10-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T10&theme=signal");
  await expect(page.locator('[data-mav-entry="indexed-event"]')).toHaveCount(
    10,
  );
  await page.locator('[data-series="value"][data-indexed-dot="Event"]').hover();
  await expect(
    page.getByText("Primary index: 118 (+18 vs 100)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Event: Policy launch", { exact: true }),
  ).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Indexed event trend interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "T+2: Primary index 139; above baseline by 39",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T10&theme=signal");
  await expect(page.locator('[data-mav-entry="indexed-event"]')).toHaveCount(0);
  for (const edge of [
    "empty",
    "single",
    "no-event",
    "missing-primary",
    "missing-comparison",
    "leading-gap",
    "trailing-gap",
    "multiple-events",
    "negative-index",
    "constant-at-100",
    "extreme",
    "long-event",
    "long-label",
    "invalid",
    "duplicate",
    "nonfinite",
  ] as const) {
    const edgePage = await browser.newPage({ viewport: layouts.mobile });
    watch(edgePage);
    const system = [
      "missing-primary",
      "multiple-events",
      "long-event",
    ].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await edgePage.goto(`/?template=T10&theme=${system}&case=${edge}&capture`);
    await edgePage.waitForLoadState("networkidle");
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await edgePage.mouse.move(0, 0);
    const chart = edgePage.locator('[data-chart-id="T10"]'),
      title = chart.getByText("The event widened indexed momentum", {
        exact: true,
      }),
      subtitle = chart.getByText(
        "TWO INDEXED SERIES · BASELINE 100 · EVENT WINDOWS",
        { exact: true },
      ),
      legend = chart.locator("[data-indexed-legend]"),
      footer = chart.locator("footer");
    await expect(title).toBeVisible();
    await expect(title).toHaveCSS("color", "rgb(255, 255, 255)");
    for (const element of [subtitle, footer])
      await expect(element).toBeVisible();
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
    if (!["invalid", "duplicate", "nonfinite", "empty"].includes(edge)) {
      await expect(legend).toBeVisible();
    }
    const group = chart.getByRole("group", {
      name: "Indexed event trend interactive chart",
    });
    if (edge === "no-event")
      await expect(group).toHaveAttribute("data-event-count", "0");
    if (edge === "multiple-events") {
      await expect(group).toHaveAttribute("data-event-count", "3");
      const annotationNodes = chart.locator("[data-event-label]");
      await expect(annotationNodes).toHaveCount(3);
      const annotations = await annotationNodes.evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect()),
      );
      const plot = await chart
        .locator(".recharts-cartesian-grid")
        .boundingBox();
      for (const annotation of annotations) {
        expect(annotation.x).toBeGreaterThanOrEqual((plot?.x ?? 0) - 1);
        expect(annotation.x + annotation.width).toBeLessThanOrEqual(
          (plot?.x ?? 0) + (plot?.width ?? 0) + 1,
        );
      }
      for (let i = 0; i < annotations.length; i++)
        for (let j = i + 1; j < annotations.length; j++)
          expect(
            overlap(annotations[i] as DOMRect, annotations[j] as DOMRect),
          ).toBe(false);
      const latest = await chart
        .locator('[data-indexed-latest="value"]')
        .evaluate((node) => node.getBoundingClientRect());
      for (const annotation of annotations)
        expect(overlap(annotation as DOMRect, latest as DOMRect)).toBe(false);
    }
    if (edge === "missing-primary") {
      await expect(group).toHaveAttribute("data-primary-segments", "2");
      await expect(group).toHaveAttribute("data-comparison-segments", "1");
      const paths = await chart
        .locator(".recharts-line-curve")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("d") ?? ""),
        );
      expect((paths[0].match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((paths[1].match(/M/g) ?? []).length).toBe(1);
    }
    if (edge === "negative-index") {
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        0,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(100);
    }
    if (edge === "constant-at-100") {
      await expect(group).toHaveAttribute("data-domain-min", "95");
      await expect(group).toHaveAttribute("data-domain-max", "105");
      await group.focus();
      await expect(edgePage.getByRole("status")).toContainText(
        "Primary index 100; at baseline; Comparison index 100; at baseline",
      );
      await group.blur();
      await expect(edgePage.getByRole("status")).toHaveCount(0);
    }
    if (edge === "long-event") {
      await expect(chart.getByRole("table")).toContainText(
        "Major cross-market policy announcement",
      );
      await expect(
        chart.locator("svg").getByText("Major cross-ma…", { exact: true }),
      ).toBeVisible();
      const annotation = await chart
          .locator("[data-event-label]")
          .boundingBox(),
        plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
      expect(annotation?.x ?? 0).toBeGreaterThanOrEqual((plot?.x ?? 0) - 1);
      expect(
        (annotation?.x ?? 0) + (annotation?.width ?? 0),
      ).toBeLessThanOrEqual((plot?.x ?? 0) + (plot?.width ?? 0) + 1);
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "First enterprise reporting interval",
      );
    const chartBox = await chart.boundingBox();
    expect(chartBox).not.toBeNull();
    await edgePage.waitForTimeout(250);
    await expect(edgePage).toHaveScreenshot(`T10-${edge}-mobile.png`, {
      animations: "disabled",
      clip: chartBox!,
    });
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1_200);
    expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
    expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    if (!["invalid", "duplicate", "nonfinite", "empty"].includes(edge))
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(600);
    await edgePage.close();
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T10&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T10"]');
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
    await expect(chart).toHaveScreenshot(`T10-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
