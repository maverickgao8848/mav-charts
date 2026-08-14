import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

async function guardChrome(page: Page, includeLegend: boolean) {
  const chart = page.locator('[data-chart-id="P01"]');
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
    const legend = chart.locator("[data-pie-legend]");
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

test("P01 renders an honest small-part composition pie", async ({
  page,
  browser,
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
      await page.goto(`/?template=P01&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      await page.mouse.move(0, 0);
      const chart = page.locator('[data-chart-id="P01"]');
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(chart.locator("[data-pie-slice]")).toHaveCount(3);
      await expect(chart.locator("[data-pie-direct-label]")).toHaveCount(3);
      await expect(chart.locator('[data-mav-entry="pie-slice"]')).toHaveCount(
        0,
      );
      const geometry = await chart
        .locator("[data-pie-slice]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            value: Number(node.getAttribute("data-value")),
            share: Number(node.getAttribute("data-share")),
            angle: Number(node.getAttribute("data-angle")),
            start: Number(node.getAttribute("data-start-angle")),
            end: Number(node.getAttribute("data-end-angle")),
          })),
        );
      expect(geometry.map(({ value }) => value)).toEqual([42, 33, 25]);
      expect(geometry.reduce((sum, { angle }) => sum + angle, 0)).toBeCloseTo(
        360,
        6,
      );
      for (const slice of geometry) {
        expect(slice.angle).toBeCloseTo(slice.share * 360, 6);
        expect(slice.end - slice.start).toBeCloseTo(slice.angle, 6);
      }
      if (system === "signal") {
        await expect(chart.locator('[data-focus="true"] path')).toHaveAttribute(
          "fill",
          "#ff0000",
        );
        await expect(
          chart.locator('[data-focus="false"]').first().locator("path"),
        ).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="P01"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const chartBox = await chart.boundingBox(),
          legendBox = await chart.locator("[data-pie-legend]").boundingBox();
        expect(legendBox?.x ?? -1).toBeGreaterThanOrEqual(chartBox?.x ?? 0);
        expect(
          (legendBox?.x ?? 0) + (legendBox?.width ?? 0),
        ).toBeLessThanOrEqual((chartBox?.x ?? 0) + (chartBox?.width ?? 0) + 1);
        for (const label of await chart
          .locator("[data-pie-direct-label]")
          .all()) {
          const box = await label.boundingBox();
          expect(box?.x ?? -1).toBeGreaterThanOrEqual((chartBox?.x ?? 0) - 1);
          expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
            (chartBox?.x ?? 0) + (chartBox?.width ?? 0) + 1,
          );
        }
      }
      await expect(
        chart.locator(".recharts-tooltip-wrapper"),
      ).not.toBeVisible();
      await expect(chart).toHaveScreenshot(`P01-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=P01&theme=signal&capture");
  const chart = page.locator('[data-chart-id="P01"]');
  await chart.locator('[data-pie-slice="Services"] path').hover();
  await expect(chart.locator("[data-pie-tooltip]")).toContainText("Value: 33");
  await expect(chart.locator("[data-pie-tooltip]")).toContainText(
    "Share of known total: 33%",
  );
  await page.mouse.move(0, 0);
  const interactive = chart.getByRole("group", {
    name: "Pie composition interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(chart.getByRole("status")).toContainText(
    "Partners: 25; 25% of known total",
  );
  await expect(chart.getByRole("table")).toContainText(
    "Core product4242%151.2",
  );

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=P01&theme=signal");
  await expect(page.locator('[data-mav-entry="pie-slice"]')).toHaveCount(3);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=P01&theme=signal");
  await expect(page.locator('[data-mav-entry="pie-slice"]')).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Pie composition interactive chart" }),
  ).toHaveAttribute("data-pie-animation", "false");

  for (const edge of [
    "empty",
    "single",
    "missing",
    "zero",
    "all-zero",
    "all-missing",
    "negative",
    "extreme",
    "long-label",
    "duplicate",
    "nonfinite",
    "blank",
  ] as const) {
    const edgePage = await browser.newPage({ viewport: layouts.mobile });
    edgePage.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        problems.push(message.text());
    });
    edgePage.on("pageerror", (error) => problems.push(error.message));
    await edgePage.goto(
      `/?template=P01&theme=${edge === "missing" || edge === "zero" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`,
    );
    await edgePage.waitForLoadState("networkidle");
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.mouse.move(0, 0);
    const edgeChart = edgePage.locator('[data-chart-id="P01"]');
    if (
      [
        "all-zero",
        "all-missing",
        "negative",
        "duplicate",
        "nonfinite",
        "blank",
      ].includes(edge)
    )
      await expect(edgeChart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(edgeChart).toHaveAttribute("data-state", "empty");
    else await expect(edgeChart).toHaveAttribute("data-state", "ready");
    if (edge === "single") {
      const slice = edgeChart.locator('[data-pie-slice="Only category"]');
      await expect(slice).toHaveAttribute("data-angle", "360");
      await expect(slice).toHaveAttribute("data-focus", "true");
    }
    if (edge === "missing") {
      await expect(edgeChart.locator("[data-pie-slice]")).toHaveCount(2);
      await expect(
        edgeChart.locator('[data-pie-legend-item="Awaiting source"]'),
      ).toContainText("Missing");
      await expect(edgeChart.getByRole("table")).toContainText(
        "Awaiting sourceMissingN/AN/A",
      );
    }
    if (edge === "zero") {
      await expect(edgeChart.locator("[data-pie-slice]")).toHaveCount(2);
      await expect(
        edgeChart.locator('[data-pie-legend-item="No contribution"]'),
      ).toContainText("0%");
      await expect(edgeChart.getByRole("table")).toContainText(
        "No contribution00%0",
      );
    }
    if (edge === "extreme") {
      const minor = edgeChart.locator('[data-pie-slice="Minor"]');
      expect(Number(await minor.getAttribute("data-angle"))).toBeGreaterThan(0);
    }
    if (edge === "long-label")
      await expect(edgeChart.getByRole("table")).toContainText(
        "Long enterprise implementation and advisory programs",
      );
    const ready = ![
      "empty",
      "all-zero",
      "all-missing",
      "negative",
      "duplicate",
      "nonfinite",
      "blank",
    ].includes(edge);
    await guardChrome(edgePage, ready);
    await expect(
      edgeChart.locator(".recharts-tooltip-wrapper"),
    ).not.toBeVisible();
    await expect(edgeChart).toHaveScreenshot(`P01-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await edgePage.close();
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=P01&theme=${system}&capture`);
    const thumbnail = page.locator('[data-chart-id="P01"]');
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
      `P01-${system}-thumbnail-25pct.png`,
      { animations: "disabled" },
    );
  }
  expect(problems).toEqual([]);
});
