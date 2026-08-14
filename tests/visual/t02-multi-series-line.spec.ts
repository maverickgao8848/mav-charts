import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

test("T02 renders two honest independently broken trends", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "One desktop project owns the responsive matrix",
  );
  const browserProblems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      browserProblems.push(message.text());
  });
  page.on("pageerror", (error) => browserProblems.push(error.message));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=T02&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T02"]');
      const interactive = chart.getByRole("group", {
        name: "Multi-series line interactive chart",
      });
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(interactive).toHaveAttribute(
        "data-multi-animation",
        "false",
      );
      await expect(interactive).toHaveAttribute("data-primary-segments", "1");
      await expect(interactive).toHaveAttribute(
        "data-comparison-segments",
        "1",
      );
      await expect(
        chart.locator('[data-mav-entry="multi-series-line"]'),
      ).toHaveCount(0);
      await expect(chart.locator('[data-series="value"]')).toHaveCount(4);
      await expect(chart.locator('[data-series="comparison"]')).toHaveCount(4);
      await expect(chart.locator(".recharts-line-curve")).toHaveCount(2);
      const primary = await chart
        .locator('[data-series="value"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            x: Number(node.getAttribute("cx")),
            y: Number(node.getAttribute("cy")),
          })),
        );
      expect(primary[1].x - primary[0].x).toBeCloseTo(
        primary[2].x - primary[1].x,
        3,
      );
      expect(primary[2].x - primary[1].x).toBeCloseTo(
        primary[3].x - primary[2].x,
        3,
      );
      const labels = chart.locator("[data-multi-latest]");
      await expect(labels).toHaveCount(2);
      const labelBoxes = await labels.evaluateAll((nodes) =>
        nodes
          .map((node) => node.getBoundingClientRect())
          .map(({ x, y, width, height }) => ({ x, y, width, height })),
      );
      const intersects = (
        a: (typeof labelBoxes)[number],
        b: (typeof labelBoxes)[number],
      ) =>
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
      expect(intersects(labelBoxes[0], labelBoxes[1])).toBe(false);
      if (system === "signal") {
        await expect(
          chart.locator(".recharts-line-curve").nth(0),
        ).toHaveAttribute("stroke", "#ff0000");
        await expect(
          chart.locator(".recharts-line-curve").nth(1),
        ).toHaveAttribute("stroke", "#f7f7f2");
        await expect(
          chart.locator('[data-series="value"]').first(),
        ).toHaveAttribute("fill", "#ff0000");
        await expect(
          chart.locator('[data-series="comparison"]').first(),
        ).toHaveAttribute("fill", "#f7f7f2");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="T02"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
          .getByText("TWO SERIES · SAME UNIT · EQUAL SPACING", { exact: true })
          .boundingBox();
        const legend = await chart.locator("[data-multi-legend]").boundingBox();
        const plot = await chart
          .locator(".recharts-cartesian-grid")
          .boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 1);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 1,
        );
      }
      await expect(chart).toHaveScreenshot(`T02-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T02&theme=signal");
  await expect(
    page.locator('[data-mav-entry="multi-series-line"]'),
  ).toHaveCount(8);
  await page.locator('[data-series="value"][data-multi-dot="Q2"]').hover();
  await expect(page.getByText("Current: 34", { exact: true })).toBeVisible();
  await expect(page.getByText("Prior: 31", { exact: true })).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Multi-series line interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Q4: Current 57; Prior 45",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T02&theme=signal");
  await expect(
    page.locator('[data-mav-entry="multi-series-line"]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Multi-series line interactive chart" }),
  ).toHaveAttribute("data-multi-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single",
    "missing-primary",
    "missing-comparison",
    "leading-gap",
    "trailing-gap",
    "negative",
    "constant",
    "extreme",
    "long-label",
    "invalid",
    "duplicate",
    "nonfinite",
  ] as const) {
    await page.goto(
      `/?template=T02&theme=${edge === "long-label" ? "editorial" : edge.startsWith("missing") ? "signal" : "digital"}&case=${edge}&capture`,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const chart = page.locator('[data-chart-id="T02"]');
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
    if (edge === "single")
      await expect(chart.locator("[data-multi-dot]")).toHaveCount(2);
    if (edge === "missing-primary") {
      await expect(
        chart.getByRole("group", {
          name: "Multi-series line interactive chart",
        }),
      ).toHaveAttribute("data-primary-segments", "2");
      await expect(
        chart.getByRole("group", {
          name: "Multi-series line interactive chart",
        }),
      ).toHaveAttribute("data-comparison-segments", "1");
      const paths = await chart
        .locator(".recharts-line-curve")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("d") ?? ""),
        );
      expect((paths[0].match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      expect((paths[1].match(/M/g) ?? []).length).toBe(1);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "missing-comparison")
      await expect(
        chart.getByRole("group", {
          name: "Multi-series line interactive chart",
        }),
      ).toHaveAttribute("data-comparison-segments", "2");
    if (edge === "trailing-gap")
      await expect(chart.locator('[data-multi-latest="value"]')).toContainText(
        "11",
      );
    if (edge === "negative")
      expect(
        Number(
          await chart
            .getByRole("group", { name: "Multi-series line interactive chart" })
            .getAttribute("data-domain-max"),
        ),
      ).toBeLessThan(0);
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "First enterprise reporting interval",
      );
    await expect(chart).toHaveScreenshot(`T02-${edge}-mobile.png`, {
      animations: "disabled",
    });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T02&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T02"]');
    await chart.evaluate((node) => {
      const element = node as HTMLElement;
      element.style.width = "960px";
      element.style.height = "624px";
      element.style.transform = "scale(.25)";
      element.style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(chart).toHaveScreenshot(`T02-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(browserProblems).toEqual([]);
});
