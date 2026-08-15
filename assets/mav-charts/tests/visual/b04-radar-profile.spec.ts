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

test("B04 keeps both profiles on one fixed normalized scale", async ({
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
      await page.goto(`/?template=B04&theme=${system}&capture`);
      await settle(page);
      const chart = page.locator('[data-chart-id="B04"]'),
        group = chart.getByRole("group", {
          name: "Radar profile interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-domain-min", "0");
      await expect(group).toHaveAttribute("data-domain-max", "100");
      await expect(group).toHaveAttribute("data-axis-count", "5");
      await expect(group).toHaveAttribute("data-primary-complete", "true");
      await expect(group).toHaveAttribute("data-comparison-complete", "true");
      await expect(group).toHaveAttribute("data-radar-animation", "false");
      await expect(chart.locator(".recharts-radar-polygon")).toHaveCount(2);
      await expect(chart.locator('[data-radar-dot^="primary:"]')).toHaveCount(
        5,
      );
      await expect(
        chart.locator('[data-radar-dot^="comparison:"]'),
      ).toHaveCount(5);
      if (system === "signal") {
        await expect(
          chart.locator(".recharts-radar-polygon .recharts-polygon").nth(0),
        ).toHaveAttribute("stroke", "#f7f7f2");
        await expect(
          chart.locator(".recharts-radar-polygon .recharts-polygon").nth(1),
        ).toHaveAttribute("stroke", "#ff0000");
        await expect(
          chart.locator('[data-radar-dot="primary:Technology"]'),
        ).toHaveAttribute("fill", "#ff0000");
        await expect(
          chart.locator('[data-radar-dot="comparison:Technology"]'),
        ).toHaveAttribute("fill", "#f7f7f2");
      }
      const direct = await chart
          .locator("[data-radar-direct-label]")
          .boundingBox(),
        chartBox = await chart.boundingBox();
      expect(direct).not.toBeNull();
      expect(chartBox).not.toBeNull();
      expect(direct!.x).toBeGreaterThanOrEqual(chartBox!.x);
      expect(direct!.x + direct!.width).toBeLessThanOrEqual(
        chartBox!.x + chartBox!.width + 1,
      );
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="B04"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("NORMALIZED SCORE · FIXED 0–100 DOMAIN · SAME AXES", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-radar-legend]").boundingBox(),
          directLabel = await chart
            .locator("[data-radar-direct-label]")
            .boundingBox(),
          plot = await chart.locator("[data-radar-plot]").boundingBox();
        expect(
          Math.floor((subtitle?.y ?? 0) + (subtitle?.height ?? 0)),
        ).toBeLessThanOrEqual(Math.floor(legend?.y ?? 0) + 2);
        expect(
          Math.floor((legend?.y ?? 0) + (legend?.height ?? 0)),
        ).toBeLessThanOrEqual(Math.floor(directLabel?.y ?? 0) + 2);
        expect(
          Math.floor((directLabel?.y ?? 0) + (directLabel?.height ?? 0)),
        ).toBeLessThanOrEqual(Math.floor(plot?.y ?? 0) + 2);
      }
      await expect(chart).toHaveScreenshot(`B04-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  expect(problems).toEqual([]);
});

test("B04 exposes Radar motion, exact tooltip, keyboard and table", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interactions owner");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=B04&theme=signal");
  const chart = page.locator('[data-chart-id="B04"]'),
    group = chart.getByRole("group", {
      name: "Radar profile interactive chart",
    });
  await expect(group).toHaveAttribute("data-radar-animation", "true");
  await expect(chart.locator('[data-mav-entry="radar-primary"]')).toHaveCount(
    5,
  );
  await expect(
    chart.locator('[data-mav-entry="radar-comparison"]'),
  ).toHaveCount(5);
  await chart.locator('[data-radar-dot="primary:Technology"]').hover();
  await expect(
    page.getByText("Current: 91 / 100", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Reference: 72 / 100", { exact: true }),
  ).toBeVisible();
  await group.focus();
  await group.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Cost: Current 58 / 100; Reference 65 / 100",
  );
  await expect(chart.getByRole("table")).toContainText(
    "Caller-provided normalized score",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=B04&theme=signal");
  await expect(page.locator("[data-mav-entry]")).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Radar profile interactive chart" }),
  ).toHaveAttribute("data-radar-animation", "false");
});

test("B04 edges never convert missing or invalid scores", async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "Desktop edges owner");
  for (const edge of [
    "empty",
    "single",
    "two-axes",
    "missing-primary",
    "missing-comparison",
    "missing-both",
    "zero",
    "boundaries",
    "constant",
    "long-label",
    "negative",
    "over-100",
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
    await page.goto(`/?template=B04&theme=signal&case=${edge}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="B04"]'),
      group = chart.getByRole("group", {
        name: "Radar profile interactive chart",
      }),
      invalid = [
        "negative",
        "over-100",
        "invalid",
        "duplicate",
        "nonfinite",
      ].includes(edge);
    await expect(chart).toHaveAttribute(
      "data-state",
      edge === "empty" ? "empty" : invalid ? "invalid" : "ready",
    );
    if (["single", "two-axes"].includes(edge)) {
      await expect(group).toHaveAttribute("data-primary-complete", "false");
      await expect(group).toHaveAttribute("data-comparison-complete", "false");
      await expect(chart.locator("[data-radar-unavailable]")).toBeVisible();
      await expect(chart.locator(".recharts-radar-polygon")).toHaveCount(0);
    }
    if (edge === "missing-primary") {
      await expect(group).toHaveAttribute("data-primary-missing", "1");
      await expect(chart.locator('[data-radar-dot="primary:B"]')).toHaveCount(
        0,
      );
      await expect(
        chart.locator('[data-radar-dot="comparison:B"]'),
      ).toHaveCount(1);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "missing-comparison") {
      await expect(group).toHaveAttribute("data-comparison-missing", "1");
      await expect(
        chart.locator('[data-radar-dot="comparison:B"]'),
      ).toHaveCount(0);
      await expect(chart.locator('[data-radar-dot="primary:B"]')).toHaveCount(
        1,
      );
    }
    if (edge === "missing-both") {
      await expect(chart.locator('[data-radar-dot$=":Missing"]')).toHaveCount(
        0,
      );
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "zero") {
      await expect(
        chart.locator('[data-radar-dot="primary:A"]'),
      ).toHaveAttribute("cx", /.+/);
      await expect(chart.getByRole("table")).toContainText("0 / 100");
    }
    if (edge === "boundaries") {
      await expect(group).toHaveAttribute("data-domain-min", "0");
      await expect(group).toHaveAttribute("data-domain-max", "100");
    }
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "Distribution channel effectiveness",
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
    await expect(page).toHaveScreenshot(`B04-${edge}-mobile.png`, {
      animations: "disabled",
      clip: box!,
    });
    const title = chart.getByText(
        "Technology leads the current capability profile",
        { exact: true },
      ),
      subtitle = chart.getByText(
        "NORMALIZED SCORE · FIXED 0–100 DOMAIN · SAME AXES",
        { exact: true },
      ),
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

test("B04 thumbnails are true scaled wide boards", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnails owner");
  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=B04&theme=${system}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="B04"]');
    await chart.evaluate((node) => {
      (node as HTMLElement).style.transform = "scale(.25)";
      (node as HTMLElement).style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(page).toHaveScreenshot(`B04-${system}-thumbnail.png`, {
      animations: "disabled",
      clip: box!,
    });
  }
});
