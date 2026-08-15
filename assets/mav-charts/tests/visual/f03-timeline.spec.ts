import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;
const layouts = { wide: { width: 1280, height: 720 }, standard: { width: 1024, height: 768 }, card: { width: 720, height: 720 }, mobile: { width: 390, height: 844 } } as const;

test("F03 renders three systems across four delivery layouts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One project owns the cross-viewport template matrix.");
  const browserProblems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) browserProblems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => browserProblems.push(`pageerror: ${error.message}`));

  for (const [layout, viewport] of Object.entries(layouts)) {
    await page.setViewportSize(viewport);
    for (const system of systems) {
      await page.goto(`/?template=F03&theme=${system}&capture`);
      await page.evaluate(() => document.fonts.ready);
      const chart = page.locator('[data-chart-id="F03"]');
      await expect(chart).toBeVisible();
      await expect(chart).toHaveAttribute("data-visual-system", system);
      await expect(chart.getByRole("group", { name: "Timeline interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
      await expect(chart.locator('[data-timeline-item]')).toHaveCount(5);
      if (layout === "wide") {
        const accessibility = await new AxeBuilder({ page }).include('[data-chart-id="F03"]').analyze();
        expect(accessibility.violations).toEqual([]);
      }
      await expect(chart).toHaveScreenshot(`F03-${system}-${layout}.png`, { animations: "disabled", caret: "hide" });
    }
  }

  await page.setViewportSize(layouts.wide);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?template=F03&theme=editorial");
  await expect(page.locator('[data-chart-id="F03"] [data-mav-entry="timeline-item"]')).toHaveCount(5);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?template=F03&theme=editorial");
  await expect(page.locator('[data-chart-id="F03"] [data-mav-entry="timeline-item"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });

  await page.goto("/?template=F03&theme=editorial&capture");
  const interactionChart = page.locator('[data-chart-id="F03"]');
  await interactionChart.locator('[data-timeline-item="Scale"]').hover();
  await expect(interactionChart.getByRole("tooltip")).toContainText("Duration 1.7");
  await expect(interactionChart.getByRole("tooltip")).not.toContainText("1.700000");
  const interactiveGroup = interactionChart.getByRole("group", { name: "Timeline interactive chart" });
  await interactiveGroup.focus();
  await expect(interactionChart.getByRole("status")).toContainText("duration 0.8");
  await expect(interactionChart.getByRole("status")).not.toContainText("0.799999");
  await expect(interactionChart.getByRole("table", { name: "Timeline intervals" }).getByRole("row", { name: /Scale/ })).toContainText("1.7");

  await page.setViewportSize(layouts.mobile);
  for (const edgeCase of ["long-label", "negative", "zero-duration", "extreme", "overlap"]) {
    await page.goto(`/?template=F03&theme=${edgeCase === "negative" ? "signal" : edgeCase === "long-label" || edgeCase === "overlap" ? "editorial" : "digital"}&case=${edgeCase}&capture`);
    await expect(page.locator('[data-chart-id="F03"]')).toHaveScreenshot(`F03-${edgeCase}-mobile.png`, { animations: "disabled" });
  }
  for (const invalidCase of ["missing", "inverted"]) {
    await page.goto(`/?template=F03&theme=digital&case=${invalidCase}&capture`);
    await expect(page.locator('[data-chart-id="F03"]')).toHaveAttribute("data-state", "invalid");
  }

  await page.setViewportSize(layouts.wide);
  for (const system of systems) {
    await page.goto(`/?template=F03&theme=${system}&capture`);
    const chart = page.locator('[data-chart-id="F03"]');
    await chart.evaluate((element) => { element.style.transform = "scale(.25)"; element.style.transformOrigin = "top left"; });
    await expect(chart).toHaveScreenshot(`F03-${system}-thumbnail.png`, { animations: "disabled" });
  }
  expect(browserProblems).toEqual([]);
});
