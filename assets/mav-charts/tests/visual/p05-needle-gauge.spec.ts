import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

async function guardChrome(
  page: import("@playwright/test").Page,
  includeLegend: boolean,
) {
  const chart = page.locator('[data-chart-id="P05"]');
  for (const selector of [".chart-header h2", ".chart-header p", "footer"]) {
    const element = chart.locator(selector);
    await expect(element).toBeVisible();
    const box = await element.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(1);
    expect(box?.height ?? 0).toBeGreaterThan(1);
    const style = await element.evaluate((node) => {
      const computed = getComputedStyle(node);
      return { opacity: computed.opacity, visibility: computed.visibility };
    });
    expect(style).toEqual({ opacity: "1", visibility: "visible" });
    expect((await element.screenshot()).byteLength).toBeGreaterThan(300);
  }
  if (includeLegend) {
    const legend = chart.locator("[data-gauge-legend]");
    await expect(legend).toBeVisible();
    expect((await legend.screenshot()).byteLength).toBeGreaterThan(300);
  }
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

test("P05 renders a linear in-range needle gauge", async ({
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
      await page.goto(`/?template=P05&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.move(0, 0);
      const chart = page.locator('[data-chart-id="P05"]'),
        gauge = chart.getByRole("group", {
          name: "Needle gauge interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.locator("[data-gauge-band]")).toHaveCount(3);
      await expect(
        chart.locator('[data-mav-entry="gauge-needle"]'),
      ).toHaveCount(0);
      const bands = await chart
        .locator("[data-gauge-band]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            share: Number(node.getAttribute("data-band-share")),
            angle: Number(node.getAttribute("data-band-angle")),
            start: Number(node.getAttribute("data-start-angle")),
            end: Number(node.getAttribute("data-end-angle")),
          })),
        );
      expect(bands.reduce((sum, band) => sum + band.share, 0)).toBeCloseTo(
        1,
        8,
      );
      expect(bands.reduce((sum, band) => sum + band.angle, 0)).toBeCloseTo(
        180,
        8,
      );
      for (const band of bands)
        expect(band.start - band.end).toBeCloseTo(band.angle, 8);
      await expect(gauge).toHaveAttribute(
        "data-needle-angle",
        "50.400000000000006",
      );
      await expect(chart.locator("[data-gauge-needle]")).toHaveAttribute(
        "data-needle-rotation",
        "39.599999999999994",
      );
      await expect(chart.locator('[data-current-band="true"]')).toHaveAttribute(
        "data-gauge-band",
        "Balanced",
      );
      if (system === "signal") {
        await expect(chart.locator("[data-gauge-needle] line")).toHaveAttribute(
          "stroke",
          "#ff0000",
        );
        await expect(
          chart.locator("[data-gauge-band]").first(),
        ).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="P05"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const chartBox = await chart.boundingBox(),
          directBox = await chart
            .locator("[data-gauge-direct-value]")
            .boundingBox(),
          headerBox = await chart.locator(".chart-header").boundingBox(),
          legendBox = await chart.locator("[data-gauge-legend]").boundingBox();
        expect(directBox?.x ?? -1).toBeGreaterThanOrEqual(chartBox?.x ?? 0);
        expect(
          (directBox?.x ?? 0) + (directBox?.width ?? 0),
        ).toBeLessThanOrEqual((chartBox?.x ?? 0) + (chartBox?.width ?? 0) + 1);
        expect(legendBox?.y ?? 0).toBeGreaterThanOrEqual(
          (headerBox?.y ?? 0) + (headerBox?.height ?? 0),
        );
      }
      await expect(chart).toHaveScreenshot(`P05-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=P05&theme=signal&capture");
  const chart = page.locator('[data-chart-id="P05"]');
  await chart.locator('[data-gauge-band="Balanced"]').hover();
  await expect(chart.locator("[data-needle-gauge-tooltip]")).toContainText(
    "40% to 75%",
  );
  await expect(chart.locator("[data-needle-gauge-tooltip]")).toContainText(
    "35% of declared range",
  );
  await page.mouse.move(0, 0);
  const interactive = chart.getByRole("group", {
    name: "Needle gauge interactive chart",
  });
  await interactive.focus();
  await expect(chart.getByRole("status")).toContainText(
    "Capacity utilization: 72%; range 0 to 100%; current band Balanced; linear angle 50.4 degrees",
  );
  await expect(chart.getByRole("table")).toContainText("Balanced407535%Yes");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=P05&theme=signal");
  await expect(page.locator('[data-mav-entry="gauge-needle"]')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=P05&theme=signal");
  await expect(page.locator('[data-mav-entry="gauge-needle"]')).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Needle gauge interactive chart" }),
  ).toHaveAttribute("data-needle-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single-band",
    "missing",
    "negative-range",
    "minimum",
    "maximum",
    "below-range",
    "above-range",
    "equal-range",
    "unordered",
    "uncovered",
    "nonfinite",
    "extreme",
    "long-label",
  ] as const) {
    const edgePage = await page
      .context()
      .browser()!
      .newPage({ viewport: layouts.mobile });
    edgePage.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        problems.push(message.text());
    });
    edgePage.on("pageerror", (error) => problems.push(error.message));
    await edgePage.goto(
      `/?template=P05&theme=${edge === "negative-range" || edge === "minimum" || edge === "maximum" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`,
    );
    await edgePage.waitForLoadState("networkidle");
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.mouse.move(0, 0);
    const edgeChart = edgePage.locator('[data-chart-id="P05"]');
    if (
      [
        "missing",
        "below-range",
        "above-range",
        "equal-range",
        "unordered",
        "uncovered",
        "nonfinite",
      ].includes(edge)
    )
      await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(edgeChart).toHaveAttribute("data-state", "empty");
    else await expect(edgeChart).toHaveAttribute("data-state", "ready");
    if (edge === "single-band") {
      await expect(edgeChart.locator("[data-gauge-band]")).toHaveCount(1);
      await expect(edgeChart.locator("[data-gauge-band]")).toHaveAttribute(
        "data-band-angle",
        "180",
      );
    }
    if (edge === "negative-range") {
      await expect(
        edgeChart.getByRole("group", {
          name: "Needle gauge interactive chart",
        }),
      ).toHaveAttribute("data-min", "-40");
      await expect(
        edgeChart.getByRole("group", {
          name: "Needle gauge interactive chart",
        }),
      ).toHaveAttribute("data-needle-angle", "96");
      await expect(
        edgeChart.locator('[data-current-band="true"]'),
      ).toHaveAttribute("data-gauge-band", "Expected");
    }
    if (edge === "minimum")
      await expect(edgeChart.locator("[data-gauge-needle]")).toHaveAttribute(
        "data-needle-rotation",
        "-90",
      );
    if (edge === "maximum")
      await expect(edgeChart.locator("[data-gauge-needle]")).toHaveAttribute(
        "data-needle-rotation",
        "90",
      );
    if (edge === "long-label")
      await expect(edgeChart.getByRole("status")).toHaveCount(0);
    const ready = ![
      "empty",
      "missing",
      "below-range",
      "above-range",
      "equal-range",
      "unordered",
      "uncovered",
      "nonfinite",
    ].includes(edge);
    await guardChrome(edgePage, ready);
    await expect(edgeChart).toHaveScreenshot(`P05-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await edgePage.close();
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=P05&theme=${system}&capture`);
    const thumbnail = page.locator('[data-chart-id="P05"]');
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
      `P05-${system}-thumbnail-25pct.png`,
      { animations: "disabled" },
    );
  }
  expect(problems).toEqual([]);
});
