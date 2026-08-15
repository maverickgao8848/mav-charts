import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

test("B01 keeps absolute scale and fixed percentage semantics honest", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "One desktop project owns the matrix",
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
      await page.goto(`/?template=B01&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="B01"]'),
        interactive = chart.getByRole("group", {
          name: "Column and percentage line interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(interactive).toHaveAttribute("data-scale-domain", "0,190.3");
      await expect(interactive).toHaveAttribute("data-rate-domain", "0,100");
      await expect(chart.locator("[data-column-line-bar]")).toHaveCount(4);
      await expect(chart.locator("[data-column-line-dot]")).toHaveCount(4);
      await expect(
        chart.locator('[data-mav-entry^="column-line"]'),
      ).toHaveCount(0);
      const rectangles = await chart
        .locator("[data-column-line-rect]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            x: Number(node.getAttribute("x")),
            y: Number(node.getAttribute("y")),
            width: Number(node.getAttribute("width")),
            height: Number(node.getAttribute("height")),
          })),
        );
      const values = [128, 143, 159, 173],
        baselines = rectangles.map(({ y, height }) => y + height);
      expect(
        Math.max(...baselines) - Math.min(...baselines),
      ).toBeLessThanOrEqual(1);
      const barScale = rectangles[3].height / values[3];
      for (let index = 0; index < values.length; index++)
        expect(rectangles[index].height / values[index]).toBeCloseTo(
          barScale,
          2,
        );
      const dots = await chart
        .locator("[data-column-line-dot]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            cx: Number(node.getAttribute("cx")),
            cy: Number(node.getAttribute("cy")),
          })),
        );
      for (let index = 0; index < dots.length; index++)
        expect(dots[index].cx).toBeCloseTo(
          rectangles[index].x + rectangles[index].width / 2,
          0,
        );
      const rates = [28, 34, 39, 42],
        rateScale = (dots[0].cy - dots[1].cy) / (rates[1] - rates[0]);
      for (let index = 1; index < dots.length; index++)
        expect(
          (dots[0].cy - dots[index].cy) / (rates[index] - rates[0]),
        ).toBeCloseTo(rateScale, 2);
      await expect(
        chart.locator("[data-column-line-direct-peak]"),
      ).toContainText("173K");
      await expect(
        chart.locator("[data-column-line-direct-latest]"),
      ).toContainText("42%");
      if (system === "signal") {
        for (const rect of await chart.locator("[data-column-line-rect]").all())
          await expect(rect).toHaveAttribute("fill", "#f7f7f2");
        await expect(
          chart.locator(".column-line-rate .recharts-line-curve"),
        ).toHaveAttribute("stroke", "#ff0000");
        for (const dot of await chart.locator("[data-column-line-dot]").all())
          await expect(dot).toHaveAttribute("fill", "#ff0000");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="B01"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const overlay = await chart
            .locator("[data-column-line-overlay]")
            .boundingBox(),
          grid = await chart.locator(".recharts-cartesian-grid").boundingBox();
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
      await expect(chart).toHaveScreenshot(`B01-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=B01&theme=signal&capture");
  const chart = page.locator('[data-chart-id="B01"]');
  await chart
    .locator('[data-column-line-bar="Q2"] [data-column-line-rect]')
    .hover();
  await expect(chart.locator("[data-column-line-tooltip]")).toContainText(
    "Orders: 143K",
  );
  await expect(chart.locator("[data-column-line-tooltip]")).toContainText(
    "Conversion: 34%",
  );
  await page.mouse.move(0, 0);
  const interactive = chart.getByRole("group", {
    name: "Column and percentage line interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(chart.getByRole("status")).toContainText(
    "Q4: Orders 173K; Conversion 42%",
  );
  await expect(chart.getByRole("table")).toContainText(
    "right fixed 0–100 axis",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=B01&theme=signal");
  await expect(page.locator('[data-mav-entry="column-line-bar"]')).toHaveCount(
    4,
  );
  await expect(page.locator('[data-mav-entry="column-line-dot"]')).toHaveCount(
    4,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=B01&theme=signal");
  await expect(page.locator('[data-mav-entry^="column-line"]')).toHaveCount(0);
  await expect(
    page.getByRole("group", {
      name: "Column and percentage line interactive chart",
    }),
  ).toHaveAttribute("data-column-line-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single",
    "missing-scale",
    "missing-rate",
    "missing-both",
    "negative-scale",
    "all-negative-scale",
    "zero",
    "extreme",
    "long-label",
    "flat",
    "rate-below",
    "rate-above",
    "duplicate",
    "nonfinite-scale",
    "nonfinite-rate",
    "blank",
  ] as const) {
    await page.goto(
      `/?template=B01&theme=${edge.startsWith("missing") || edge === "negative-scale" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const edgeChart = page.locator('[data-chart-id="B01"]');
    if (
      [
        "rate-below",
        "rate-above",
        "duplicate",
        "nonfinite-scale",
        "nonfinite-rate",
        "blank",
      ].includes(edge)
    )
      await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(edgeChart).toHaveAttribute("data-state", "empty");
    else await expect(edgeChart).toHaveAttribute("data-state", "ready");
    if (edge === "missing-scale") {
      await expect(edgeChart.locator("[data-column-line-bar]")).toHaveCount(2);
      await expect(edgeChart.locator("[data-column-line-dot]")).toHaveCount(3);
    }
    if (edge === "missing-rate") {
      await expect(edgeChart.locator("[data-column-line-bar]")).toHaveCount(3);
      await expect(edgeChart.locator("[data-column-line-dot]")).toHaveCount(2);
      const path = await edgeChart
        .locator(".column-line-rate .recharts-line-curve")
        .getAttribute("d");
      expect((path?.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
    }
    if (edge === "missing-both") {
      await expect(edgeChart.locator("[data-column-line-bar]")).toHaveCount(2);
      await expect(edgeChart.locator("[data-column-line-dot]")).toHaveCount(2);
      await expect(edgeChart.getByRole("table")).toContainText(
        "FebMissingMissing",
      );
    }
    if (edge === "negative-scale") {
      const baselineBox = await edgeChart
        .locator(".recharts-reference-line-line")
        .boundingBox();
      expect(baselineBox).not.toBeNull();
      const baseline = baselineBox!.y + baselineBox!.height / 2;
      const bars = await edgeChart
        .locator("[data-column-line-bar]")
        .evaluateAll((nodes) =>
          nodes
            .map((node) => ({
              value: Number(node.getAttribute("data-scale-value")),
              rect: (
                node.querySelector("rect") as SVGRectElement
              ).getBoundingClientRect(),
            }))
            .map(({ value, rect }) => ({
              value,
              top: rect.top,
              bottom: rect.bottom,
            })),
        );
      for (const bar of bars) {
        if (bar.value < 0) expect(bar.top).toBeCloseTo(baseline, 0);
        else expect(bar.bottom).toBeCloseTo(baseline, 0);
      }
    }
    if (edge === "long-label")
      await expect(edgeChart.getByRole("table")).toContainText(
        "January after international product expansion",
      );
    expect(await edgeChart.locator("[data-column-line-tooltip]").count()).toBe(
      0,
    );
    await expect(edgeChart).toHaveScreenshot(`B01-${edge}-mobile.png`, {
      animations: "disabled",
    });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=B01&theme=${system}&capture`);
    const thumbnail = page.locator('[data-chart-id="B01"]');
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
      `B01-${system}-thumbnail-25pct.png`,
      { animations: "disabled" },
    );
  }
  expect(problems).toEqual([]);
});
