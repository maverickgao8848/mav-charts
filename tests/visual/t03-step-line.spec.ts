import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;

const pathTurns = (path: string) => {
  const numbers =
    path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)?.map(Number) ?? [];
  const points = Array.from(
    { length: Math.floor(numbers.length / 2) },
    (_, index) => ({ x: numbers[index * 2], y: numbers[index * 2 + 1] }),
  );
  let horizontal = 0;
  let vertical = 0;
  for (let index = 1; index < points.length; index++) {
    if (
      Math.abs(points[index].y - points[index - 1].y) < 0.1 &&
      Math.abs(points[index].x - points[index - 1].x) > 1
    )
      horizontal++;
    if (
      Math.abs(points[index].x - points[index - 1].x) < 0.1 &&
      Math.abs(points[index].y - points[index - 1].y) > 1
    )
      vertical++;
  }
  return { points, horizontal, vertical };
};

test("T03 renders a true stepAfter path with honest gaps", async ({
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
      await page.goto(`/?template=T03&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T03"]');
      const interactive = chart.getByRole("group", {
        name: "Step line interactive chart",
      });
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(interactive).toHaveAttribute("data-step-after", "true");
      await expect(interactive).toHaveAttribute("data-step-segments", "1");
      await expect(interactive).toHaveAttribute("data-step-animation", "false");
      await expect(chart.locator('[data-mav-entry="step-line"]')).toHaveCount(
        0,
      );
      await expect(chart.locator("[data-step-dot]")).toHaveCount(4);
      await expect(chart.locator("[data-step-latest]")).toContainText(
        "LATEST 73",
      );
      const path = await chart
        .locator(".recharts-line-curve")
        .getAttribute("d");
      const turns = pathTurns(path ?? "");
      expect(turns.horizontal).toBeGreaterThanOrEqual(3);
      expect(turns.vertical).toBeGreaterThanOrEqual(3);
      const dots = await chart
        .locator("[data-step-dot]")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            x: Number(node.getAttribute("cx")),
            y: Number(node.getAttribute("cy")),
          })),
        );
      expect(dots[1].x - dots[0].x).toBeCloseTo(dots[2].x - dots[1].x, 3);
      expect(dots[2].x - dots[1].x).toBeCloseTo(dots[3].x - dots[2].x, 3);
      if (system === "signal") {
        await expect(chart.locator(".recharts-line-curve")).toHaveAttribute(
          "stroke",
          "#ff0000",
        );
        for (const dot of await chart.locator("[data-step-dot]").all())
          await expect(dot).toHaveAttribute("fill", "#ff0000");
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="T03"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
          .getByText("STEP AFTER · HOLD, THEN CHANGE", { exact: true })
          .boundingBox();
        const legend = await chart.locator("[data-step-legend]").boundingBox();
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
      await expect(chart).toHaveScreenshot(`T03-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=T03&theme=signal");
  await expect(page.locator('[data-mav-entry="step-line"]')).toHaveCount(4);
  await page.locator('[data-step-dot="Stage 2"]').hover();
  await expect(page.getByText("State: 32", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Applies after this observation until the next.", {
      exact: true,
    }),
  ).toBeVisible();
  const interactive = page.getByRole("group", {
    name: "Step line interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Stage 4: State 73; held until next observation",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=T03&theme=signal");
  await expect(page.locator('[data-mav-entry="step-line"]')).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Step line interactive chart" }),
  ).toHaveAttribute("data-step-animation", "false");

  await page.setViewportSize(layouts.mobile);
  for (const edge of [
    "empty",
    "single",
    "missing",
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
    const system = ["missing", "negative"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await page.goto(`/?template=T03&theme=${system}&case=${edge}&capture`);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(0, 0);
    const chart = page.locator('[data-chart-id="T03"]');
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
    if (edge === "single") {
      await expect(chart.locator("[data-step-dot]")).toHaveCount(1);
      await expect(chart.locator("[data-step-latest]")).toContainText("24");
    }
    if (edge === "missing") {
      await expect(
        chart.getByRole("group", { name: "Step line interactive chart" }),
      ).toHaveAttribute("data-step-segments", "2");
      const gapPath = await chart
        .locator(".recharts-line-curve")
        .getAttribute("d");
      expect((gapPath?.match(/M/g) ?? []).length).toBeGreaterThanOrEqual(2);
      await expect(chart.getByRole("table")).toContainText("Feb");
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "leading-gap")
      await expect(chart.locator("[data-step-dot]").first()).toHaveAttribute(
        "data-step-dot",
        "First report",
      );
    if (edge === "trailing-gap")
      await expect(chart.locator("[data-step-latest]")).toContainText("11");
    if (edge === "negative")
      expect(
        Number(
          await chart
            .getByRole("group", { name: "Step line interactive chart" })
            .getAttribute("data-domain-max"),
        ),
      ).toBeLessThan(0);
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "First enterprise policy interval",
      );
    await expect(chart).toHaveScreenshot(`T03-${edge}-mobile.png`, {
      animations: "disabled",
    });
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=T03&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T03"]');
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
    await expect(chart).toHaveScreenshot(`T03-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(browserProblems).toEqual([]);
});
