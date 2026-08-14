import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;
test("C09 normalizes only complete columns to an honest 100 percent scale", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns matrix");
  const problems: string[] = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) problems.push(m.text());
  });
  page.on("pageerror", (e) => problems.push(e.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=C09&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="C09"]');
      await expect(chart).toBeVisible();
      await expect(
        chart.getByRole("group", {
          name: "100 percent stacked interactive chart",
        }),
      ).toHaveAttribute("data-percent-animation", "false");
      await expect(chart.locator("[data-percent-bar]")).toHaveCount(8);
      for (const label of ["2022", "2023", "2024", "2025"]) {
        const primary = chart.locator(`[data-percent-bar="${label}:value"]`),
          comparison = chart.locator(
            `[data-percent-bar="${label}:comparison"]`,
          );
        const a = await primary.locator("rect").boundingBox(),
          b = await comparison.locator("rect").boundingBox();
        expect(
          Math.abs((b?.y ?? 0) + (b?.height ?? 0) - (a?.y ?? 0)),
        ).toBeLessThanOrEqual(1);
        const integerPair =
          (await primary.locator("[data-percent-label]").textContent())! +
          "+" +
          (await comparison.locator("[data-percent-label]").textContent())!;
        expect(
          Number(integerPair.split("+")[0].replace("%", "")) +
            Number(integerPair.split("+")[1].replace("%", "")),
        ).toBe(100);
      }
      if (system === "signal") {
        await expect(
          chart.locator('[data-series="value"] rect').first(),
        ).toHaveAttribute("fill", "#ff0000");
        await expect(
          chart.locator('[data-series="value"] rect').last(),
        ).toHaveAttribute("fill", "#ff0000");
        await expect(
          chart.locator('[data-series="comparison"] rect').first(),
        ).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="C09"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("TWO-PART COMPOSITION · NORMALIZED TO 100%", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-percent-legend]").boundingBox(),
          plot = await chart.locator(".recharts-cartesian-grid").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await expect(chart).toHaveScreenshot(`C09-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=C09&theme=signal");
  await expect(page.locator('[data-mav-entry="percent-stacked"]')).toHaveCount(
    8,
  );
  await page.locator('[data-percent-bar="2022:value"] rect').hover();
  await expect(
    page.getByText("Primary: 32 · 32.00%", { exact: true }),
  ).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "100 percent stacked interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "2025: Primary 57% (57 raw); Comparison 43% (43 raw)",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=C09&theme=signal");
  await expect(page.locator('[data-mav-entry="percent-stacked"]')).toHaveCount(
    0,
  );
  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single",
    "missing-value",
    "missing-comparison",
    "zero-segment",
    "extreme-ratios",
    "long-label",
  ] as const) {
    await page.goto(
      `/?template=C09&theme=${edge === "zero-segment" ? "signal" : edge === "long-label" ? "editorial" : "digital"}&case=${edge}&capture`,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const chart = page.locator('[data-chart-id="C09"]');
    expect((await chart.boundingBox())?.y).toBeLessThanOrEqual(16.5);
    expect(
      await chart.locator(".recharts-tooltip-wrapper").evaluateAll((nodes) =>
        nodes.every((node) => getComputedStyle(node).visibility !== "visible"),
      ),
    ).toBe(true);
    if (edge.startsWith("missing")) {
      await expect(chart.locator("[data-percent-bar]")).toHaveCount(2);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "extreme-ratios") {
      await expect(
        chart.locator('[data-percent-bar="Tiny share:value"]'),
      ).toHaveAttribute("data-share", "1e-9");
      await expect(chart.getByRole("table")).toContainText("0.0000%");
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "Enterprise customers across northern metropolitan territories",
      );
    await expect(chart).toHaveScreenshot(`C09-${edge}-mobile.png`, {
      animations: "disabled",
    });
  }
  for (const edge of [
    "zero-total",
    "negative",
    "duplicate",
    "nonfinite",
  ] as const) {
    await page.goto(`/?template=C09&theme=digital&case=${edge}&capture`);
    await expect(page.locator('[data-chart-id="C09"]')).toHaveAttribute(
      "data-state",
      "invalid",
    );
  }
  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=C09&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="C09"]');
    await chart.evaluate((node) => {
      const el = node as HTMLElement;
      el.style.width = "960px";
      el.style.height = "624px";
      el.style.transform = "scale(.25)";
      el.style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(chart).toHaveScreenshot(`C09-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
