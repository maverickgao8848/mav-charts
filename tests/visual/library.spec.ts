import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Library implements the catalog-driven site architecture", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns cross-viewport Library coverage.");
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("说真话的图表");
  await expect(page.getByRole("link", { name: "浏览图表库" })).toHaveAttribute("href", "/library");
  await expect(page.locator(".system-tile")).toHaveCount(3);
  await expect(page.locator(".featured-grid .library-card")).toHaveCount(6);
  await expect(page).toHaveScreenshot("library-home-wide.png", { animations: "disabled", caret: "hide" });
  expect((await new AxeBuilder({ page }).include(".home-page").analyze()).violations).toEqual([]);

  await page.goto("/library?question=compare&system=editorial", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator(".library-card").count()).toBeGreaterThan(0);
  await expect(page.locator(".library-card").first().locator(".library-card-taxonomy span")).toHaveCount(3);
  await expect(page.locator(".library-card").first().getByRole("link", { name: "查看图表", exact: true })).toBeVisible();
  await expect(page.locator(".library-card").first().getByRole("link", { name: "GitHub 源码" })).toBeVisible();
  await expect(page.locator(".library-card").first().locator("img")).toHaveAttribute("src", /-editorial\.png$/);
  await expect(page).toHaveURL(/\/library\?question=compare&system=editorial/);
  const search = page.getByPlaceholder("图表编号、名称或业务问题…");
  await search.fill("profit bridge");
  await expect(page.locator(".library-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=profit\+bridge/);
  await expect(page).toHaveScreenshot("library-index-wide.png", { animations: "disabled", caret: "hide" });
  expect((await new AxeBuilder({ page }).include(".catalog-page").analyze()).violations).toEqual([]);

  await page.goto("/charts/C01?system=signal", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-library-detail="C01"]')).toBeVisible();
  await expect(page.locator(".detail-documentation")).toContainText("SimpleColumnDatum");
  await expect(page.locator(".code-example")).toContainText("SimpleColumnChart");
  await expect(page.getByRole("link", { name: "OPEN GITHUB SOURCE" })).toHaveAttribute("href", /packages\/charts\/src\/C01-simple-columns\/index\.tsx$/);
  const preview = page.frameLocator('iframe[title*="Simple Columns live"]');
  await expect(preview.locator('[data-chart-id="C01"]')).toBeVisible();
  const previewBox = await page.locator(".detail-stage iframe").boundingBox();
  expect(previewBox?.width).toBeGreaterThan(1100);
  await page.getByRole("button", { name: "editorial" }).click();
  await expect(page).toHaveURL(/\/charts\/C01\?system=editorial/);
  await expect(page.locator(".detail-stage iframe")).toHaveAttribute("src", /theme=editorial/);
  await expect(page).toHaveScreenshot("library-detail-wide.png", { animations: "disabled", caret: "hide" });
  expect((await new AxeBuilder({ page }).include(".detail-page").exclude("iframe").analyze()).violations).toEqual([]);

  for (const route of ["/collections/finance", "/guides", "/about"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("main.library-shell")).toBeVisible();
  }
  await expect(page.locator(".about-grid")).toContainText("MIT 许可证");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/library", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".library-card")).toHaveCount(48);
  await expect(page).toHaveScreenshot("library-index-mobile.png", { animations: "disabled", caret: "hide" });
  expect(problems).toEqual([]);
});
