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

test("F06 renders honest radial hierarchy across systems and layouts", async ({
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
      await page.goto(`/?template=F06&theme=${system}&capture`);
      await settle(page);
      const chart = page.locator('[data-chart-id="F06"]'),
        group = chart.getByRole("group", {
          name: "Sunburst interactive chart",
        });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-total", "100");
      await expect(group).toHaveAttribute("data-leaf-count", "5");
      await expect(group).toHaveAttribute("data-parent-count", "3");
      await expect(group).toHaveAttribute("data-max-depth", "2");
      await expect(group).toHaveAttribute("data-sunburst-animation", "false");
      await expect(chart.locator(".recharts-sector")).toHaveCount(8);
      await expect(
        chart.locator('[data-sunburst-node="Hardware"]'),
      ).toHaveAttribute("data-node-value", "48");
      await expect(
        chart.locator('[data-sunburst-node="Hardware"]'),
      ).toHaveAttribute("data-node-start", "0");
      expect(
        Number(
          await chart
            .locator('[data-sunburst-node="Hardware"]')
            .getAttribute("data-node-end"),
        ),
      ).toBeCloseTo(172.8);
      await expect(
        chart.locator('[data-sunburst-node="Hardware / Compute"]'),
      ).toHaveAttribute("data-node-depth", "2");
      if (system === "signal") {
        const sectors = chart.locator(".recharts-sector");
        await expect(sectors.nth(0)).toHaveAttribute("fill", "#8f1712");
        await expect(sectors.nth(1)).toHaveAttribute("fill", "#ff0000");
        await expect(sectors.nth(2)).toHaveAttribute("fill", "#f7f7f2");
        expect(
          await sectors.evaluateAll(
            (nodes) =>
              nodes.filter((node) => node.getAttribute("fill") === "#ff0000")
                .length,
          ),
        ).toBe(1);
      }
      const direct = await chart
          .locator("[data-sunburst-direct-label]")
          .boundingBox(),
        plot = await chart.locator("[data-sunburst-plot]").boundingBox();
      expect(direct).not.toBeNull();
      expect(plot).not.toBeNull();
      expect(direct!.x).toBeGreaterThanOrEqual(plot!.x);
      expect(direct!.x + direct!.width).toBeLessThanOrEqual(
        plot!.x + plot!.width + 1,
      );
      expect(direct!.y).toBeGreaterThanOrEqual(plot!.y);
      expect(direct!.y + direct!.height).toBeLessThanOrEqual(
        plot!.y + plot!.height + 1,
      );
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="F06"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
            .getByText(
              "SUNBURST · ANGLE ENCODES VALUE · RADIUS ENCODES DEPTH",
              { exact: true },
            )
            .boundingBox(),
          legend = await chart.locator("[data-sunburst-legend]").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 2);
        expect((legend?.y ?? 0) + (legend?.height ?? 0)).toBeLessThanOrEqual(
          (plot?.y ?? 0) + 2,
        );
      }
      await expect(chart).toHaveScreenshot(`F06-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }
  expect(problems).toEqual([]);
});

test("F06 exposes real entry motion, hierarchy tooltip, keyboard and table", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop interactions owner");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=F06&theme=signal");
  const chart = page.locator('[data-chart-id="F06"]'),
    group = chart.getByRole("group", { name: "Sunburst interactive chart" }),
    plot = chart.locator("[data-sunburst-plot]");
  await expect(group).toHaveAttribute("data-sunburst-animation", "true");
  await expect(plot).toHaveAttribute("data-mav-entry", "sunburst");
  await expect(plot).toHaveCSS("animation-name", "mav-sunburst-signal");
  await chart.locator(".recharts-sector").nth(1).dispatchEvent("mouseover");
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toContainText("Hardware / Compute");
  await expect(tooltip).toContainText("Leaf value: 30");
  await expect(tooltip).toContainText("Share: 30.0%");
  await expect(tooltip).toContainText("Depth: 2");
  await group.focus();
  await group.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Services / Support: 12; 12.0% of reported total",
  );
  await expect(chart.getByRole("table")).toContainText("Angular share");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=F06&theme=signal");
  await expect(page.locator("[data-sunburst-plot]")).not.toHaveAttribute(
    "data-mav-entry",
    "sunburst",
  );
  await expect(
    page.getByRole("group", { name: "Sunburst interactive chart" }),
  ).toHaveAttribute("data-sunburst-animation", "false");
  await expect(page.locator("[data-sunburst-plot]")).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("F06 edges preserve missing paths, depth and angular extremes", async ({
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
    await page.goto(`/?template=F06&theme=signal&case=${edge}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="F06"]'),
      group = chart.getByRole("group", { name: "Sunburst interactive chart" }),
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
      await expect(chart.locator(".recharts-sector")).toHaveCount(2);
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-leaf-count", "2");
      await expect(group).toHaveAttribute("data-missing-count", "1");
      await expect(
        chart.locator('[data-sunburst-node="A / Missing"]'),
      ).toHaveCount(0);
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "zero") {
      await expect(group).toHaveAttribute("data-zero-count", "1");
      await expect(
        chart.locator('[data-sunburst-node="A / Zero"]'),
      ).toHaveCount(0);
    }
    if (edge === "all-zero")
      await expect(chart.locator("[data-sunburst-no-area]")).toBeVisible();
    if (edge === "deep") {
      await expect(group).toHaveAttribute("data-max-depth", "3");
      await expect(
        chart.locator('[data-sunburst-node="Region / North / Enterprise"]'),
      ).toHaveAttribute("data-node-depth", "3");
    }
    if (edge === "unbalanced")
      await expect(group).toHaveAttribute("data-max-depth", "3");
    if (edge === "extreme") {
      const dominant = chart.locator('[data-sunburst-node="Large / Dominant"]');
      expect(
        Number(await dominant.getAttribute("data-node-end")) -
          Number(await dominant.getAttribute("data-node-start")),
      ).toBeGreaterThan(359.9);
    }
    if (edge === "many")
      await expect(group).toHaveAttribute("data-leaf-count", "18");
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "North American commercial operations / Enterprise reporting division",
      );
    expect(await chart.locator("[role=tooltip]").count()).toBe(0);
    if (edge !== "empty" && !invalid) {
      const title = chart.getByText(
          "Hardware occupies almost half of the reported portfolio",
          { exact: true },
        ),
        subtitle = chart.getByText(
          "SUNBURST · ANGLE ENCODES VALUE · RADIUS ENCODES DEPTH",
          { exact: true },
        ),
        legend = chart.locator("[data-sunburst-legend]"),
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
    await expect(page).toHaveScreenshot(`F06-${edge}-mobile.png`, {
      animations: "disabled",
      clip: box!,
    });
    expect(problems).toEqual([]);
    await page.close();
  }
});

test("F06 thumbnails are true scaled wide boards", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop thumbnails owner");
  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=F06&theme=${system}&capture`);
    await settle(page);
    const chart = page.locator('[data-chart-id="F06"]');
    await chart.evaluate((node) => {
      (node as HTMLElement).style.transform = "scale(.25)";
      (node as HTMLElement).style.transformOrigin = "top left";
    });
    const box = await chart.boundingBox();
    expect(box?.width).toBeCloseTo(240, 0);
    expect(box?.height).toBeCloseTo(156, 0);
    await expect(page).toHaveScreenshot(`F06-${system}-thumbnail.png`, {
      animations: "disabled",
      clip: box!,
    });
  }
});
