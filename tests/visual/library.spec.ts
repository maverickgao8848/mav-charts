import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Library is catalog-driven, searchable, shareable and links to live charts", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns cross-viewport Library coverage.");
  const problems: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?capture", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".library-card")).toHaveCount(48);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find the chart");
  await expect(page).toHaveScreenshot("library-wide.png", { animations: "disabled", caret: "hide" });

  const accessibility = await new AxeBuilder({ page }).include(".library-shell").analyze();
  expect(accessibility.violations).toEqual([]);

  const search = page.getByPlaceholder("ID, name, question…");
  await search.fill("profit bridge");
  await expect(page.locator(".library-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=profit\+bridge/);
  await expect(page.getByRole("heading", { name: "Profit Bridge / Waterfall" })).toBeVisible();
  await search.fill("");

  await page.getByLabel("QUESTION").selectOption("flow");
  await expect(page).toHaveURL(/question=flow/);
  expect(await page.locator(".library-card").count()).toBeGreaterThan(0);
  await page.getByLabel("QUESTION").selectOption("all");
  await page.getByRole("button", { name: "editorial" }).click();
  await expect(page).toHaveURL(/system=editorial/);

  const firstCard = page.locator(".library-card").first();
  await expect(firstCard.getByRole("link", { name: "SOURCE" })).toHaveAttribute("href", /github\.com\/maverickgao8848\/mav-charts\/blob\/main/);
  await firstCard.getByRole("link", { name: /Open Simple Columns/ }).click();
  await expect(page).toHaveURL(/template=C01.*theme=editorial.*library=1/);
  await expect(page.locator('[data-chart-id="C01"]')).toBeVisible();
  await expect(page.getByRole("link", { name: /BACK TO LIBRARY/ })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?capture", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".library-card")).toHaveCount(48);
  await expect(page).toHaveScreenshot("library-mobile.png", { animations: "disabled", caret: "hide" });
  expect(problems).toEqual([]);
});
