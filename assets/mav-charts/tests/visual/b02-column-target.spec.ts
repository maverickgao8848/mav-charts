import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

test("B02 maps actual columns and targets to one honest axis", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "One desktop project owns the full matrix",
  );
  const problems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=B02&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="B02"]'),
        interactive = chart.getByRole("group", {
          name: "Column and target interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(interactive).toHaveAttribute(
        "data-column-target-domain",
        "0,100.10000000000001",
      );
      await expect(chart.locator("[data-column-target-bar]")).toHaveCount(4);
      await expect(chart.locator("[data-column-target-marker]")).toHaveCount(4);
      await expect(
        chart.locator('[data-mav-entry^="column-target"]'),
      ).toHaveCount(0);
      const bars = await chart
        .locator("[data-column-target-bar]")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.querySelector("rect")!;
            return {
              value: Number(node.getAttribute("data-actual")),
              x: Number(rect.getAttribute("x")),
              y: Number(rect.getAttribute("y")),
              width: Number(rect.getAttribute("width")),
              height: Number(rect.getAttribute("height")),
            };
          }),
        );
      const baselines = bars.map(({ y, height }) => y + height);
      expect(
        Math.max(...baselines) - Math.min(...baselines),
      ).toBeLessThanOrEqual(1);
      const scale = bars[3].height / bars[3].value;
      for (const bar of bars)
        expect(bar.height / bar.value).toBeCloseTo(scale, 2);
      const markers = await chart
        .locator("[data-column-target-marker-line]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            centerX:
              (Number(node.getAttribute("x1")) +
                Number(node.getAttribute("x2"))) /
              2,
            y: Number(node.getAttribute("y1")),
          })),
        );
      expect(
        Math.max(...markers.map(({ y }) => y)) -
          Math.min(...markers.map(({ y }) => y)),
      ).toBeLessThanOrEqual(0.5);
      for (let index = 0; index < markers.length; index++)
        expect(markers[index].centerX).toBeCloseTo(
          bars[index].x + bars[index].width / 2,
          0,
        );
      await expect(
        chart.locator("[data-column-target-direct-focus]"),
      ).toContainText("TEAM ONE · 12K BELOW");
      if (system === "signal") {
        await expect(
          chart.locator('[data-focus="true"] [data-column-target-rect]'),
        ).toHaveAttribute("fill", "#ff0000");
        for (const bar of await chart
          .locator(
            '[data-column-target-bar][data-focus="false"] [data-column-target-rect]',
          )
          .all())
          await expect(bar).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="B02"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("ACTUAL K · TARGET K · SHARED ZERO-INCLUSIVE AXIS", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart
            .locator("[data-column-target-legend]")
            .boundingBox(),
          overlay = await chart
            .locator("[data-column-target-overlay]")
            .boundingBox(),
          grid = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(
          Math.floor((subtitle?.y ?? 0) + (subtitle?.height ?? 0)),
        ).toBeLessThanOrEqual(Math.floor(legend?.y ?? 0) + 2);
        expect((overlay?.y ?? 0) + (overlay?.height ?? 0)).toBeLessThanOrEqual(
          (grid?.y ?? 0) + 1,
        );
        const ticks = await chart
          .locator(".recharts-xAxis .recharts-cartesian-axis-tick")
          .evaluateAll((nodes) =>
            nodes
              .map((node) =>
                (node as SVGGraphicsElement).getBoundingClientRect(),
              )
              .map(({ left, right }) => ({ left, right })),
          );
        for (let index = 1; index < ticks.length; index++)
          expect(ticks[index].left).toBeGreaterThanOrEqual(
            ticks[index - 1].right,
          );
      }
      await expect(chart).toHaveScreenshot(`B02-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=B02&theme=signal&capture");
  const chart = page.locator('[data-chart-id="B02"]');
  await chart
    .locator('[data-column-target-bar="Team one"] [data-column-target-rect]')
    .hover();
  await expect(chart.locator("[data-column-target-tooltip]")).toContainText(
    "Actual: 68K",
  );
  await expect(chart.locator("[data-column-target-tooltip]")).toContainText(
    "Target: 80K",
  );
  await expect(chart.locator("[data-column-target-tooltip]")).toContainText(
    "12K BELOW",
  );
  await page.mouse.move(0, 0);
  const interactive = chart.getByRole("group", {
    name: "Column and target interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(chart.getByRole("status")).toContainText(
    "Team four: Actual 91K; Target 80K; delta 11K ABOVE",
  );
  await expect(chart.getByRole("table")).toContainText(
    "Delta actual minus target",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=B02&theme=signal");
  await expect(
    page.locator('[data-mav-entry="column-target-bar"]'),
  ).toHaveCount(4);
  await expect(
    page.locator('[data-mav-entry="column-target-marker"]'),
  ).toHaveCount(4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=B02&theme=signal");
  await expect(page.locator('[data-mav-entry^="column-target"]')).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("group", { name: "Column and target interactive chart" }),
  ).toHaveAttribute("data-column-target-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single",
    "missing-actual",
    "missing-target",
    "missing-both",
    "signed",
    "all-negative",
    "zero",
    "equal",
    "ties",
    "variable-targets",
    "extreme",
    "long-label",
    "duplicate",
    "nonfinite-actual",
    "nonfinite-target",
    "blank",
  ] as const) {
    await page.goto(
      `/?template=B02&theme=${edge.startsWith("missing") || edge === "signed" || edge === "ties" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const edgeChart = page.locator('[data-chart-id="B02"]');
    if (
      ["duplicate", "nonfinite-actual", "nonfinite-target", "blank"].includes(
        edge,
      )
    )
      await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(edgeChart).toHaveAttribute("data-state", "empty");
    else await expect(edgeChart).toHaveAttribute("data-state", "ready");
    if (edge === "missing-actual") {
      await expect(edgeChart.locator("[data-column-target-bar]")).toHaveCount(
        2,
      );
      await expect(
        edgeChart.locator("[data-column-target-marker]"),
      ).toHaveCount(3);
    }
    if (edge === "missing-target") {
      await expect(edgeChart.locator("[data-column-target-bar]")).toHaveCount(
        3,
      );
      await expect(
        edgeChart.locator("[data-column-target-marker]"),
      ).toHaveCount(2);
    }
    if (edge === "missing-both") {
      await expect(edgeChart.locator("[data-column-target-bar]")).toHaveCount(
        2,
      );
      await expect(
        edgeChart.locator("[data-column-target-marker]"),
      ).toHaveCount(2);
      await expect(edgeChart.getByRole("table")).toContainText(
        "BMissingMissingN/A",
      );
    }
    if (edge === "signed" || edge === "all-negative") {
      const baseline = Number(
          await edgeChart
            .locator(".recharts-reference-line-line")
            .getAttribute("y1"),
        ),
        markerLines = edgeChart.locator("[data-column-target-marker-line]"),
        expectedTargets = edge === "signed" ? [-10, 12, 4] : [-15, -12],
        markerA = Number(await markerLines.nth(0).getAttribute("y1")),
        markerB = Number(await markerLines.nth(1).getAttribute("y1")),
        pixelsPerUnit =
          (markerA - markerB) / (expectedTargets[1] - expectedTargets[0]);
      for (let index = 0; index < expectedTargets.length; index++)
        expect(
          Number(await markerLines.nth(index).getAttribute("y1")),
        ).toBeCloseTo(baseline - expectedTargets[index] * pixelsPerUnit, 0);
      const signedBars = await edgeChart
        .locator("[data-column-target-bar]")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.querySelector("rect")!;
            const value = Number(node.getAttribute("data-actual")),
              y = Number(rect.getAttribute("y")),
              height = Number(rect.getAttribute("height"));
            return {
              value,
              y,
              height,
              endpoint: value < 0 ? y + height : y,
              baseline: value < 0 ? y : y + height,
            };
          }),
        );
      for (const bar of signedBars) {
        expect(bar.height).toBeGreaterThan(0);
        expect(bar.baseline).toBeCloseTo(baseline, 0);
        expect(bar.endpoint).toBeCloseTo(
          baseline - bar.value * pixelsPerUnit,
          0,
        );
      }
    }
    if (edge === "zero") {
      await expect(edgeChart.locator("[data-column-target-bar]")).toHaveCount(
        2,
      );
      await expect(
        edgeChart.locator("[data-column-target-marker]"),
      ).toHaveCount(2);
    }
    if (edge === "equal") {
      await expect(edgeChart.locator('[data-focus="true"]')).toHaveCount(0);
      await expect(
        edgeChart.locator("[data-column-target-direct-focus]"),
      ).toContainText("ALL COMPARABLE VALUES ON TARGET");
    }
    if (edge === "ties") {
      await expect(
        edgeChart.locator('[data-column-target-bar][data-focus="true"]'),
      ).toHaveCount(1);
      await expect(
        edgeChart.locator('[data-column-target-bar][data-focus="true"]'),
      ).toHaveAttribute("data-column-target-bar", "A");
    }
    if (edge === "variable-targets") {
      const positions = await edgeChart
        .locator("[data-column-target-marker-line]")
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.getAttribute("y1"))),
        );
      expect(new Set(positions.map(Math.round)).size).toBe(3);
    }
    if (edge === "long-label")
      await expect(edgeChart.getByRole("table")).toContainText(
        "Northern enterprise customer success organization",
      );
    expect(
      await edgeChart.locator("[data-column-target-tooltip]").count(),
    ).toBe(0);
    await expect(edgeChart).toHaveScreenshot(`B02-${edge}-mobile.png`, {
      animations: "disabled",
    });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=B02&theme=${system}&capture`);
    const thumbnail = page.locator('[data-chart-id="B02"]');
    await thumbnail.evaluate((node) => {
      const element = node as HTMLElement;
      element.style.width = "960px";
      element.style.height = "624px";
      element.style.transform = "scale(.25)";
      element.style.transformOrigin = "top left";
    });
    const box = await thumbnail.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(thumbnail).toHaveScreenshot(
      `B02-${system}-thumbnail-25pct.png`,
      { animations: "disabled" },
    );
  }
  expect(problems).toEqual([]);
});
