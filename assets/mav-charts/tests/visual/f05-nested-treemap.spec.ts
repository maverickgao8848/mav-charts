import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
const systems = ["signal", "editorial", "digital"] as const,
  layouts = {
    wide: { width: 1280, height: 720 },
    standard: { width: 1024, height: 768 },
    card: { width: 720, height: 720 },
    mobile: { width: 390, height: 844 },
  } as const;
const overlap = (a: DOMRect, b: DOMRect) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;
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

test("F05 renders aggregated hierarchy across systems and layouts", async ({
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
      await page.goto(`/?template=F05&theme=${system}&capture`);
      await settle(page);
      const chart = page.locator('[data-chart-id="F05"]'),
        group = chart.getByRole("group", {
          name: "Nested treemap interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-total", "100");
      await expect(group).toHaveAttribute("data-leaf-count", "5");
      await expect(group).toHaveAttribute("data-parent-count", "3");
      await expect(group).toHaveAttribute("data-max-depth", "2");
      await expect(group).toHaveAttribute("data-nested-animation", "false");
      await expect(chart.locator("[data-nested-leaf]")).toHaveCount(5);
      await expect(
        chart.locator('[data-nested-parent="Hardware"]'),
      ).toHaveAttribute("data-parent-total", "48");
      await expect(
        chart.locator('[data-nested-parent="Software"]'),
      ).toHaveAttribute("data-parent-total", "40");
      if (system === "signal") {
        await expect(
          chart.locator('[data-nested-leaf="Hardware / Compute"] rect'),
        ).toHaveAttribute("fill", "#ff0000");
        await expect(
          chart.locator('[data-nested-leaf="Hardware / Storage"] rect'),
        ).toHaveAttribute("fill", "#f7f7f2");
        await expect(
          chart.locator('[data-nested-leaf="Software / Platform"] rect'),
        ).toHaveAttribute("fill", "#8f1712");
      }
      const boxes = await chart
        .locator("[data-nested-leaf]")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getBoundingClientRect()),
        );
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++)
          expect(overlap(boxes[i] as DOMRect, boxes[j] as DOMRect)).toBe(false);
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="F05"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText("NESTED MARKET MAP · PARENT AREA SUMS REPORTED LEAVES", {
              exact: true,
            })
            .boundingBox(),
          legend = await chart.locator("[data-nested-legend]").boundingBox(),
          first = await chart
            .locator("[data-nested-parent]")
            .first()
            .boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 2);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (first?.y ?? 0) + 2,
        );
      }
      await expect(chart).toHaveScreenshot(`F05-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  expect(problems).toEqual([]);
});

test("F05 exposes hierarchy tooltip, keyboard table and motion", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interaction owner");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=F05&theme=signal");
  const chart = page.locator('[data-chart-id="F05"]'),
    group = chart.getByRole("group", {
      name: "Nested treemap interactive chart",
    });
  await expect(group).toHaveAttribute("data-nested-animation", "true");
  await expect(
    chart.locator('[data-mav-entry="nested-treemap-leaf"]'),
  ).toHaveCount(5);
  await chart.locator('[data-nested-leaf="Software / Platform"]').hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toContainText("Software / Platform");
  await expect(tooltip).toContainText("Leaf value: 24");
  await expect(tooltip).toContainText("Share: 24.0%");
  await group.focus();
  await group.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Services / Support: 12; 12.0% of reported total",
  );
  await expect(chart.getByRole("table")).toContainText("Hierarchy path");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=F05&theme=signal");
  await expect(
    page.locator('[data-mav-entry="nested-treemap-leaf"]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole("group", { name: "Nested treemap interactive chart" }),
  ).toHaveAttribute("data-nested-animation", "false");
});

test("F05 edges preserve missing paths and genuine depth", async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  test.skip(testInfo.project.name !== "desktop", "Desktop edges owner");
  for (const edge of [
    "empty",
    "single",
    "missing",
    "zero",
    "all-zero",
    "deep",
    "extreme",
    "long-label",
    "many",
    "unbalanced",
    "negative",
    "invalid-depth",
    "blank",
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
    await page.goto(`/?template=F05&theme=signal&case=${edge}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="F05"]'),
      group = chart.getByRole("group", {
        name: "Nested treemap interactive chart",
      }),
      invalid = [
        "negative",
        "invalid-depth",
        "blank",
        "duplicate",
        "nonfinite",
      ].includes(edge);
    await expect(chart).toHaveAttribute(
      "data-state",
      edge === "empty" ? "empty" : invalid ? "invalid" : "ready",
    );
    if (edge === "single") {
      await expect(group).toHaveAttribute("data-leaf-count", "1");
      await expect(group).toHaveAttribute("data-parent-count", "1");
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-leaf-count", "2");
      await expect(group).toHaveAttribute("data-missing-count", "1");
      await expect(
        chart.locator('[data-nested-leaf="A / Missing leaf"]'),
      ).toHaveCount(0);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "zero") {
      await expect(group).toHaveAttribute("data-zero-count", "1");
      await expect(
        chart.locator('[data-nested-leaf="A / Zero leaf"]'),
      ).toHaveCount(0);
    }
    if (edge === "all-zero")
      await expect(chart.locator("[data-nested-no-area]")).toBeVisible();
    if (edge === "deep") {
      await expect(group).toHaveAttribute("data-max-depth", "3");
      await expect(
        chart.locator('[data-nested-leaf="Region / North / Enterprise"]'),
      ).toHaveAttribute("data-depth", "3");
      await expect(
        chart.locator('[data-nested-parent="Region / North"]'),
      ).toHaveAttribute("data-parent-total", "50");
    }
    if (edge === "unbalanced")
      await expect(group).toHaveAttribute("data-max-depth", "3");
    if (edge === "many")
      await expect(group).toHaveAttribute("data-leaf-count", "18");
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "North American commercial operations / Enterprise reporting division",
      );
    expect(await chart.locator("[role=tooltip]").count()).toBe(0);
    if (edge !== "empty" && !invalid) {
      const title = chart.getByText(
          "Hardware remains the largest branch of the portfolio",
          { exact: true },
        ),
        subtitle = chart.getByText(
          "NESTED MARKET MAP · PARENT AREA SUMS REPORTED LEAVES",
          { exact: true },
        ),
        legend = chart.locator("[data-nested-legend]"),
        footer = chart.locator("footer");
      for (const element of [title, subtitle, legend, footer]) {
        await expect(element).toBeVisible();
        expect(await element.boundingBox()).not.toBeNull();
        expect(
          await element.evaluate((node) => {
            const style = getComputedStyle(node);
            return style.visibility !== "hidden" && Number(style.opacity) > 0;
          }),
        ).toBe(true);
      }
      expect((await title.screenshot()).byteLength).toBeGreaterThan(1200);
      expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(500);
      expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
    }
    const box = await chart.boundingBox();
    expect(box).not.toBeNull();
    await expect(page).toHaveScreenshot(`F05-${edge}-mobile.png`, {
      animations: "disabled",
      clip: box!,
    });
    expect(problems).toEqual([]);
    await page.close();
  }
});

test("F05 thumbnails are true scaled wide boards", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnails owner");
  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=F05&theme=${system}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="F05"]');
    await chart.evaluate((node) => {
      (node as HTMLElement).style.transform = "scale(.25)";
      (node as HTMLElement).style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(page).toHaveScreenshot(`F05-${system}-thumbnail.png`, {
      animations: "disabled",
      clip: box!,
    });
  }
});
