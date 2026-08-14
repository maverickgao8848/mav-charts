import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = {
  wide: { width: 1280, height: 720 },
  standard: { width: 1024, height: 768 },
  card: { width: 720, height: 720 },
  mobile: { width: 390, height: 844 },
} as const;
const inside = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) =>
  a.x >= b.x - 1 &&
  a.y >= b.y - 1 &&
  a.x + a.width <= b.x + b.width + 1 &&
  a.y + a.height <= b.y + b.height + 1;

test("F02 preserves honest directed Sankey flow geometry", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(210_000);
  test.skip(
    info.project.name !== "desktop",
    "desktop owns the deterministic matrix",
  );
  const problems: string[] = [];
  const watch = (target: typeof page, prefix = "") => {
    target.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        problems.push(`${prefix}${message.text()}`);
    });
    target.on("pageerror", (error) =>
      problems.push(`${prefix}${error.message}`),
    );
  };
  watch(page);

  for (const [layout, viewport] of Object.entries(layouts)) {
    for (const system of systems) {
      await page.setViewportSize(viewport);
      await page.goto(`/?template=F02&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="F02"]');
      const group = chart.getByRole("group", {
        name: "Sankey interactive chart",
      });
      await expect(chart).toHaveAttribute("data-state", "ready");
      await expect(group).toHaveAttribute("data-animation-enabled", "false");
      await expect(group).toHaveAttribute("data-visible-links", "7");
      await expect(group).toHaveAttribute("data-visible-nodes", "7");
      await expect(chart.locator("[data-sankey-link]")).toHaveCount(7);
      await expect(chart.locator("[data-sankey-node]")).toHaveCount(7);
      const input = chart.locator('[data-sankey-link="Inputs→Production"]');
      const brand = chart.locator('[data-sankey-link="Production→Brand"]');
      const inputWidth = Number(await input.getAttribute("data-link-width"));
      const brandWidth = Number(await brand.getAttribute("data-link-width"));
      expect(inputWidth / brandWidth).toBeCloseTo(82 / 61, 2);
      const inputPath = input.locator("[data-sankey-ribbon]");
      expect(await inputPath.getAttribute("d")).toMatch(
        /^M[\d.,-]+C[\d., -]+$/,
      );
      const chartBox = await chart.boundingBox();
      for (const node of await chart.locator("[data-sankey-node] rect").all()) {
        const box = await node.boundingBox();
        expect(box && chartBox && inside(box, chartBox)).toBe(true);
      }
      for (const label of await chart
        .locator("[data-sankey-node-label]")
        .all()) {
        const box = await label.boundingBox();
        expect(box && chartBox && inside(box, chartBox)).toBe(true);
      }
      if (system === "signal") {
        await expect(inputPath).toHaveAttribute("stroke", "#ff0000");
        await expect(brand.locator("[data-sankey-ribbon]")).toHaveAttribute(
          "stroke",
          "#ffffff",
        );
        await expect(chart.locator("[data-sankey-legend]")).toContainText(
          "RIBBON WIDTH = VALUE",
        );
      }
      if (layout === "wide")
        expect(
          (
            await new AxeBuilder({ page })
              .include('[data-chart-id="F02"]')
              .analyze()
          ).violations,
        ).toEqual([]);
      if (layout === "mobile") {
        const subtitle = await chart
          .getByText("VALUE CHAIN · RIBBON WIDTH = FLOW", { exact: true })
          .boundingBox();
        const legend = await chart
          .locator("[data-sankey-legend]")
          .boundingBox();
        const sankey = await chart.locator(".recharts-wrapper").boundingBox();
        expect(
          (subtitle?.y ?? 0) + (subtitle?.height ?? 0),
        ).toBeLessThanOrEqual((legend?.y ?? 0) + 2);
        expect(legend && sankey && inside(legend, chartBox!)).toBe(true);
        expect(sankey && chartBox && inside(sankey, chartBox)).toBe(true);
      }
      await page.mouse.move(0, 0);
      await expect(chart).toHaveScreenshot(`F02-${system}-${layout}.png`, {
        animations: "disabled",
      });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=F02&theme=signal");
  await expect(page.locator('[data-mav-entry="sankey-link"]')).toHaveCount(7);
  await expect(page.locator('[data-mav-entry="sankey-node"]')).toHaveCount(7);
  const topmostLink = page.locator('[data-sankey-link="Channel→Customers"]');
  await topmostLink.locator("[data-sankey-ribbon]").hover();
  await expect(page.getByRole("tooltip")).toContainText("Channel → Customers");
  await expect(page.getByRole("tooltip")).toContainText("47");
  const interactive = page.getByRole("group", {
    name: "Sankey interactive chart",
  });
  await interactive.focus();
  await interactive.press("End");
  await expect(page.getByRole("status")).toContainText(
    "Channel to Customers: 47",
  );
  await expect(page.getByRole("table")).toContainText(
    "All material entering the chain",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=F02&theme=signal");
  await expect(page.locator('[data-mav-entry^="sankey-"]')).toHaveCount(0);

  const edges = [
    "empty",
    "single",
    "missing",
    "split",
    "merge",
    "deep",
    "extreme",
    "long-label",
    "invalid",
    "zero",
    "blank",
    "self",
    "cycle",
    "duplicate",
    "nonfinite",
  ] as const;
  for (const edge of edges) {
    const edgePage = await browser.newPage({ viewport: layouts.mobile });
    watch(edgePage, `${edge}:`);
    const system = ["missing", "split", "deep"].includes(edge)
      ? "signal"
      : edge === "long-label"
        ? "editorial"
        : "digital";
    await edgePage.goto(`/?template=F02&theme=${system}&case=${edge}&capture`);
    await edgePage.evaluate(() => document.fonts.ready);
    await edgePage.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await edgePage.mouse.move(0, 0);
    const chart = edgePage.locator('[data-chart-id="F02"]');
    const title = chart.getByRole("heading", {
      name: "Production feeds two routes to customers",
    });
    const subtitle = chart.getByText("VALUE CHAIN · RIBBON WIDTH = FLOW", {
      exact: true,
    });
    const footer = chart.locator("footer");
    for (const element of [title, subtitle, footer]) {
      await expect(element).toBeVisible();
      const box = await element.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(120);
      expect(box?.height ?? 0).toBeGreaterThan(6);
      const style = await element.evaluate((node) => {
        const computed = getComputedStyle(node);
        return {
          display: computed.display,
          visibility: computed.visibility,
          opacity: Number(computed.opacity),
          color: computed.color,
        };
      });
      expect(style.display).not.toBe("none");
      expect(style.visibility).toBe("visible");
      expect(style.opacity).toBeGreaterThanOrEqual(0.99);
      expect(style.color).not.toBe("rgba(0, 0, 0, 0)");
    }
    expect((await title.screenshot()).byteLength).toBeGreaterThan(1200);
    expect((await subtitle.screenshot()).byteLength).toBeGreaterThan(500);
    expect((await footer.screenshot()).byteLength).toBeGreaterThan(400);
    if (
      [
        "invalid",
        "zero",
        "blank",
        "self",
        "cycle",
        "duplicate",
        "nonfinite",
      ].includes(edge)
    )
      await expect(chart).toHaveAttribute("data-state", "invalid");
    else if (edge === "empty")
      await expect(chart).toHaveAttribute("data-state", "empty");
    else {
      await expect(chart).toHaveAttribute("data-state", "ready");
      const legend = chart.locator("[data-sankey-legend]");
      await expect(legend).toBeVisible();
      expect((await legend.screenshot()).byteLength).toBeGreaterThan(600);
    }
    const group = chart.getByRole("group", {
      name: "Sankey interactive chart",
    });
    if (edge === "single") {
      await expect(group).toHaveAttribute("data-visible-links", "1");
      await expect(group).toHaveAttribute("data-visible-nodes", "2");
    }
    if (edge === "missing") {
      await expect(group).toHaveAttribute("data-visible-links", "2");
      await expect(chart.locator('[data-sankey-node="Pending"]')).toHaveCount(
        0,
      );
      await expect(chart.getByRole("table")).toContainText("Missing");
    }
    if (edge === "split") {
      const widths = await chart
        .locator("[data-sankey-link]")
        .evaluateAll((links) =>
          links.map((link) => Number(link.getAttribute("data-link-width"))),
        );
      expect(widths[1] / widths[2]).toBeCloseTo(68 / 32, 2);
    }
    if (edge === "merge")
      await expect(group).toHaveAttribute("data-visible-nodes", "3");
    if (edge === "deep")
      await expect(group).toHaveAttribute("data-visible-nodes", "6");
    if (edge === "extreme")
      await expect(chart.getByRole("table")).toContainText("1.8B");
    if (edge === "long-label")
      await expect(chart.getByRole("table")).toContainText(
        "North American enterprise acquisition",
      );
    expect(
      await chart
        .locator('[role="tooltip"]')
        .evaluateAll((nodes) =>
          nodes.every(
            (node) => getComputedStyle(node).visibility !== "visible",
          ),
        ),
    ).toBe(true);
    await expect(chart).toHaveScreenshot(`F02-${edge}-mobile.png`, {
      animations: "disabled",
    });
    await edgePage.close();
  }

  for (const system of systems) {
    await page.setViewportSize(layouts.wide);
    await page.goto(`/?template=F02&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="F02"]');
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
    await expect(chart).toHaveScreenshot(`F02-${system}-thumbnail-25pct.png`, {
      animations: "disabled",
    });
  }
  expect(problems).toEqual([]);
});
