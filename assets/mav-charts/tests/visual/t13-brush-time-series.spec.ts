import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("T13 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=T13&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="T13"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Brush and zoom time series interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator('.recharts-brush')).toBeVisible();
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="T13"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`T13-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.mobile);
  await page.goto("/?template=T13&theme=editorial&case=long-label&capture");
  await expect(page.locator('[data-chart-id="T13"]')).toHaveScreenshot("T13-long-label-mobile.png", { animations: "disabled" });
  await page.goto("/?template=T13&theme=digital&case=missing&capture");
  await expect(page.locator('[data-chart-id="T13"]')).toHaveAttribute("data-state", "invalid");
  await page.goto("/?template=T13&theme=editorial&case=invalid&capture");
  await expect(page.locator('[data-chart-id="T13"]')).toHaveAttribute("data-state", "invalid");
  await page.goto("/?template=T13&theme=signal&case=signed&capture");
  await expect(page.locator('[data-chart-id="T13"]')).toHaveScreenshot("T13-signed-mobile.png", { animations: "disabled" });
  await page.goto("/?template=T13&theme=digital&case=extreme&capture");
  await expect(page.locator('[data-chart-id="T13"]')).toHaveScreenshot("T13-extreme-mobile.png", { animations: "disabled" });

  await page.setViewportSize(layouts.wide);
  await page.goto("/?template=T13&theme=signal&capture");
  const interactiveChart = page.locator('[data-chart-id="T13"]');
  const firstTraveller = interactiveChart.locator(".recharts-brush-traveller").first();
  await expect(firstTraveller).toHaveAttribute("aria-label", "Start of selected time range: 00:00");
  await expect(firstTraveller).toHaveAttribute("aria-valuenow", "0");
  await expect(firstTraveller).toHaveAttribute("aria-valuetext", "00:00");
  const travellerBefore = await firstTraveller.boundingBox();
  const pathBefore = await interactiveChart.locator(".recharts-area-area").getAttribute("d");
  expect(travellerBefore).not.toBeNull();
  await page.mouse.move(travellerBefore!.x + travellerBefore!.width / 2, travellerBefore!.y + travellerBefore!.height / 2);
  await page.mouse.down();
  await page.mouse.move(travellerBefore!.x + 300, travellerBefore!.y + travellerBefore!.height / 2, { steps: 12 });
  await page.mouse.up();
  await expect.poll(async () => (await firstTraveller.boundingBox())?.x ?? 0).toBeGreaterThan(travellerBefore!.x + 100);
  await expect(firstTraveller).not.toHaveAttribute("aria-valuenow", "0");
  await expect(firstTraveller).toHaveAttribute("aria-valuetext", /\d{2}:00/);
  await expect.poll(() => interactiveChart.locator(".recharts-area-area").getAttribute("d")).not.toBe(pathBefore);

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=T13&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="T13"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`T13-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
