import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.mouse.move(0, 0);
}

async function guardChrome(page: Page, includeLegend: boolean) {
  const chart = page.locator('[data-chart-id="P02"]');
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
    const legend = chart.locator("[data-donut-legend]");
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

test("P02 renders an honest proportional donut in every delivery layout", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(
    testInfo.project.name !== "desktop",
    "Desktop owns the complete matrix",
  );
  const problems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts))
    for (const system of systems) {
      await page.setViewportSize(viewport);
      await page.goto(`/?template=P02&theme=${system}&capture`);
      await settle(page);
      const chart = page.locator('[data-chart-id="P02"]');
      const group = chart.getByRole("group", {
        name: "Donut interactive chart",
      });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-total", "100");
      await expect(group).toHaveAttribute("data-slice-count", "3");
      await expect(group).toHaveAttribute("data-donut-animation", "false");
      await expect(chart.locator(".recharts-sector")).toHaveCount(3);
      const shares = await chart
        .locator("[data-donut-slice]")
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.getAttribute("data-share"))),
        );
      expect(shares).toEqual([0.73, 0.18, 0.09]);
      expect(shares.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
      const angles = await chart
        .locator("[data-donut-slice]")
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.getAttribute("data-angle"))),
        );
      expect(angles).toEqual([262.8, 64.8, 32.4]);
      expect(angles.reduce((sum, value) => sum + value, 0)).toBeCloseTo(360, 8);
      await expect(chart.locator("[data-donut-center]")).toContainText("100");
      await expect(chart.locator("[data-donut-center]")).toContainText(
        "REPORTED TOTAL",
      );
      if (system === "signal")
        await expect(
          chart.locator('[data-donut-slice="Enterprise"]'),
        ).toHaveAttribute("fill", "#ff0000");
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="P02"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const chartBox = await chart.boundingBox();
        const headerBox = await chart.locator(".chart-header").boundingBox();
        const legendBox = await chart
          .locator("[data-donut-legend]")
          .boundingBox();
        const plotBox = await chart.locator("[data-donut-plot]").boundingBox();
        expect(legendBox?.x ?? -1).toBeGreaterThanOrEqual(
          (chartBox?.x ?? 0) - 1,
        );
        expect(
          (legendBox?.x ?? 0) + (legendBox?.width ?? 0),
        ).toBeLessThanOrEqual((chartBox?.x ?? 0) + (chartBox?.width ?? 0) + 1);
        expect(legendBox?.y ?? 0).toBeGreaterThanOrEqual(
          (headerBox?.y ?? 0) + (headerBox?.height ?? 0),
        );
        expect(
          (legendBox?.y ?? 0) + (legendBox?.height ?? 0),
        ).toBeLessThanOrEqual((plotBox?.y ?? 0) + 2);
      }
      await expect(
        chart.locator(".recharts-tooltip-wrapper"),
      ).not.toBeVisible();
      await expect(chart).toHaveScreenshot(`P02-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  expect(problems).toEqual([]);
});

test("P02 exposes true motion, selected KPI, tooltip, keyboard and complete table", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns interactions");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=P02&theme=signal");
  const chart = page.locator('[data-chart-id="P02"]');
  const group = chart.getByRole("group", { name: "Donut interactive chart" });
  await expect(group).toHaveAttribute("data-donut-animation", "true");
  await expect(chart.locator(".recharts-sector")).toHaveCount(3);
  await chart.locator('[data-donut-slice="Mid-market"]').hover();
  await expect(chart.getByRole("tooltip")).toContainText("Mid-market");
  await expect(chart.getByRole("tooltip")).toContainText("18 · 18.0%");
  await expect(chart.locator("[data-donut-center]")).toContainText("18");
  await expect(chart.locator("[data-donut-center]")).toContainText(
    "Mid-market · 18.0%",
  );
  await page.mouse.move(0, 0);
  await group.focus();
  await group.press("End");
  await expect(chart.getByRole("status")).toContainText(
    "Self-serve: 9; 9.0% of reported total",
  );
  await expect(chart.getByRole("table")).toContainText("Enterprise7373.0%");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=P02&theme=signal");
  await expect(
    page.getByRole("group", { name: "Donut interactive chart" }),
  ).toHaveAttribute("data-donut-animation", "false");
});

test("P02 edge fixtures preserve missing, zero and the positive reported total", async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "Desktop owns edges");
  for (const edge of [
    "empty",
    "single",
    "missing",
    "zero",
    "all-zero",
    "equal",
    "extreme",
    "long-label",
    "many",
    "negative",
    "duplicate",
    "blank",
    "nonfinite",
  ] as const) {
    const page = await browser.newPage({ viewport: layouts.mobile });
    await page.goto(
      `/?template=P02&theme=${edge === "long-label" ? "editorial" : "signal"}&case=${edge}&capture`,
    );
    await settle(page);
    const chart = page.locator('[data-chart-id="P02"]');
    const invalid = [
      "all-zero",
      "negative",
      "duplicate",
      "blank",
      "nonfinite",
    ].includes(edge);
    await expect(chart).toHaveAttribute(
      "data-state",
      edge === "empty" ? "empty" : invalid ? "invalid" : "ready",
    );
    if (edge === "single") {
      await expect(
        chart.getByRole("group", { name: "Donut interactive chart" }),
      ).toHaveAttribute("data-total", "42");
      await expect(chart.locator(".recharts-sector")).toHaveCount(1);
    }
    if (edge === "missing") {
      await expect(
        chart.getByRole("group", { name: "Donut interactive chart" }),
      ).toHaveAttribute("data-missing-count", "1");
      await expect(
        chart.locator('[data-donut-slice="Awaiting report"]'),
      ).toHaveCount(0);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "zero") {
      await expect(
        chart.getByRole("group", { name: "Donut interactive chart" }),
      ).toHaveAttribute("data-zero-count", "1");
      await expect(
        chart.locator('[data-donut-slice="Zero allocation"]'),
      ).toHaveCount(0);
      await expect(chart.getByRole("table")).toContainText("0%");
    }
    if (edge === "all-zero") {
      await expect(
        chart.getByText("The supplied data is invalid"),
      ).toBeVisible();
      await expect(chart.locator(".recharts-sector")).toHaveCount(0);
    }
    if (edge === "extreme") {
      const shares = await chart
        .locator("[data-donut-slice]")
        .evaluateAll((nodes) =>
          nodes.map((node) => Number(node.getAttribute("data-share"))),
        );
      expect(shares.reduce((sum, value) => sum + value, 0)).toBeCloseTo(1, 8);
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "Enterprise customers in international regulated markets",
      );
    await guardChrome(page, !invalid && edge !== "empty");
    expect(await chart.locator('[role="tooltip"]').count()).toBe(0);
    await expect(chart).toHaveScreenshot(`P02-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await page.close();
  }
});

test("P02 thumbnails are true quarter-scale wide boards", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns thumbnails");
  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=P02&theme=${system}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="P02"]');
    await chart.evaluate((node) => {
      const element = node as HTMLElement;
      element.style.transform = "scale(.25)";
      element.style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(page).toHaveScreenshot(`P02-${system}-thumbnail.png`, {
      animations: "disabled",
      clip: box!,
    });
  }
});
