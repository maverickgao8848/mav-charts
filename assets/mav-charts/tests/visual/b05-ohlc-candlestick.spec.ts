import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const,
  layouts = {
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

test("B05 maps every wick and body to one honest price domain", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "Desktop matrix owner");
  const problems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=B05&theme=${system}&capture`);
      await settle(page);
      const chart = page.locator('[data-chart-id="B05"]'),
        group = chart.getByRole("group", {
          name: "OHLC candlestick interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-candle-count", "5");
      await expect(group).toHaveAttribute("data-missing-count", "0");
      await expect(group).toHaveAttribute("data-ohlc-animation", "false");
      expect(
        Number(await group.getAttribute("data-domain-min")),
      ).toBeGreaterThan(0);
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        98,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(124);
      await expect(chart.locator("[data-ohlc-candle]")).toHaveCount(5);
      for (const label of [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ]) {
        const candle = chart.locator(`[data-ohlc-candle="${label}"]`),
          high = Number(await candle.getAttribute("data-high")),
          low = Number(await candle.getAttribute("data-low")),
          open = Number(await candle.getAttribute("data-open")),
          close = Number(await candle.getAttribute("data-close")),
          wickTop = Number(await candle.getAttribute("data-wick-top")),
          wickBottom = Number(await candle.getAttribute("data-wick-bottom")),
          bodyTop = Number(await candle.getAttribute("data-body-top")),
          bodyHeight = Number(await candle.getAttribute("data-body-height"));
        expect(low).toBeLessThanOrEqual(Math.min(open, close));
        expect(high).toBeGreaterThanOrEqual(Math.max(open, close));
        expect(wickTop).toBeLessThanOrEqual(bodyTop + 1);
        expect(wickBottom).toBeGreaterThanOrEqual(bodyTop + bodyHeight - 1);
      }
      if (system === "signal") {
        await expect(
          chart.locator('[data-ohlc-candle="Monday"] [data-ohlc-body]'),
        ).toHaveAttribute("fill", "#ff0000");
        await expect(
          chart.locator('[data-ohlc-candle="Tuesday"] [data-ohlc-body]'),
        ).toHaveAttribute("fill", "#000000");
        await expect(
          chart.locator('[data-ohlc-candle="Tuesday"] [data-ohlc-body]'),
        ).toHaveAttribute("stroke", "#f7f7f2");
        await expect(
          chart.locator('[data-ohlc-candle="Friday"]'),
        ).toHaveAttribute("data-focus", "true");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="B05"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("OHLC · SHARED PRICE SCALE · WICK + BODY", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-ohlc-legend]").boundingBox(),
          direct = await chart
            .locator("[data-ohlc-direct-label]")
            .boundingBox(),
          plot = await chart.locator("[data-ohlc-plot]").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (direct?.y ?? 0) + 1,
        );
        expect((direct?.y ?? 0) + (direct?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
        const ticks = await chart
          .locator(".recharts-xAxis .recharts-cartesian-axis-tick-value")
          .evaluateAll((nodes) =>
            nodes
              .map((node) =>
                (node as SVGGraphicsElement).getBoundingClientRect(),
              )
              .map(({ left, right }) => ({ left, right })),
          );
        for (let index = 1; index < ticks.length; index++)
          expect(ticks[index].left).toBeGreaterThanOrEqual(
            ticks[index - 1].right + 2,
          );
      }
      await expect(chart).toHaveScreenshot(`B05-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  expect(problems).toEqual([]);
});

test("B05 exposes custom-shape motion, OHLC tooltip, keyboard and table", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interactions owner");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=B05&theme=signal");
  const chart = page.locator('[data-chart-id="B05"]'),
    group = chart.getByRole("group", {
      name: "OHLC candlestick interactive chart",
    });
  await expect(group).toHaveAttribute("data-ohlc-animation", "true");
  await expect(chart.locator('[data-mav-entry="ohlc-wick"]')).toHaveCount(5);
  await expect(chart.locator('[data-mav-entry="ohlc-body"]')).toHaveCount(5);
  await chart.locator('[data-ohlc-candle="Tuesday"]').hover();
  await expect(page.getByText("Open 109", { exact: true })).toBeVisible();
  await expect(page.getByText("High 113", { exact: true })).toBeVisible();
  await expect(page.getByText("Low 102", { exact: true })).toBeVisible();
  await expect(page.getByText("Close 104", { exact: true })).toBeVisible();
  await expect(page.getByText("DOWN · Δ -5", { exact: true })).toBeVisible();
  await group.focus();
  await group.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Friday: open 114; high 124; low 112; close 122; up",
  );
  await expect(chart.getByRole("table")).toContainText("OHLC trading sessions");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=B05&theme=signal");
  await expect(page.locator("[data-mav-entry]")).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "OHLC candlestick interactive chart" }),
  ).toHaveAttribute("data-ohlc-animation", "false");
});

test("B05 edges preserve missing whole candles, signed prices and flat sessions", async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "Desktop edges owner");
  for (const edge of [
    "empty",
    "single",
    "missing",
    "partial-missing",
    "up-down-flat",
    "negative",
    "constant",
    "extreme",
    "long-label",
    "invalid-low",
    "invalid-high",
    "invalid",
    "duplicate",
    "nonfinite",
  ] as const) {
    const page = await browser.newPage({ viewport: layouts.mobile }),
      problems: string[] = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));
    await page.goto(`/?template=B05&theme=signal&case=${edge}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="B05"]'),
      group = chart.getByRole("group", {
        name: "OHLC candlestick interactive chart",
      }),
      invalid = [
        "partial-missing",
        "invalid-low",
        "invalid-high",
        "invalid",
        "duplicate",
        "nonfinite",
      ].includes(edge);
    await expect(chart).toHaveAttribute(
      "data-state",
      edge === "empty" ? "empty" : invalid ? "invalid" : "ready",
    );
    if (edge === "single") {
      await expect(group).toHaveAttribute("data-candle-count", "1");
      const bodyWidth = Number(
        await chart.locator("[data-ohlc-body]").getAttribute("width"),
      );
      expect(bodyWidth).toBeLessThanOrEqual(30);
      expect(bodyWidth).toBeGreaterThanOrEqual(4);
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-candle-count", "2");
      await expect(group).toHaveAttribute("data-missing-count", "1");
      await expect(chart.locator('[data-ohlc-candle="Holiday"]')).toHaveCount(
        0,
      );
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "up-down-flat") {
      await expect(chart.locator('[data-ohlc-candle="Up"]')).toHaveAttribute(
        "data-direction",
        "up",
      );
      await expect(chart.locator('[data-ohlc-candle="Down"]')).toHaveAttribute(
        "data-direction",
        "down",
      );
      await expect(chart.locator('[data-ohlc-candle="Flat"]')).toHaveAttribute(
        "data-direction",
        "flat",
      );
      await expect(
        chart.locator('[data-ohlc-candle="Flat"] [data-ohlc-body]'),
      ).toHaveAttribute("height", "3");
    }
    if (edge === "negative") {
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        -30,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(8);
    }
    if (edge === "constant") {
      await expect(group).toHaveAttribute("data-domain-min", "47.5");
      await expect(group).toHaveAttribute("data-domain-max", "52.5");
    }
    if (edge === "extreme") {
      expect(Number(await group.getAttribute("data-domain-min"))).toBeLessThan(
        -0.0002,
      );
      expect(
        Number(await group.getAttribute("data-domain-max")),
      ).toBeGreaterThan(1_500_000_000);
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "Post-announcement continuous trading session",
      );
    expect(
      await chart
        .locator(".recharts-tooltip-wrapper")
        .evaluateAll((nodes) =>
          nodes.every(
            (node) => getComputedStyle(node).visibility !== "visible",
          ),
        ),
    ).toBe(true);
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    await expect(page).toHaveScreenshot(`B05-${edge}-mobile.png`, {
      animations: "disabled",
      clip: box!,
    });
    const title = chart.getByText(
        "Friday closed at the week’s high-water mark",
        { exact: true },
      ),
      subtitle = chart.getByText("OHLC · SHARED PRICE SCALE · WICK + BODY", {
        exact: true,
      }),
      footer = chart.locator("footer");
    for (const element of [title, subtitle, footer])
      await expect(element).toBeVisible();
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1200);
    expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
    expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    expect(problems).toEqual([]);
    await page.close();
  }
});

test("B05 thumbnails are true scaled wide boards", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnails owner");
  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=B05&theme=${system}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="B05"]');
    await chart.evaluate((node) => {
      (node as HTMLElement).style.transform = "scale(.25)";
      (node as HTMLElement).style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(page).toHaveScreenshot(`B05-${system}-thumbnail.png`, {
      animations: "disabled",
      clip: box!,
    });
  }
});
