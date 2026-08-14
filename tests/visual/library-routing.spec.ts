import { expect, test } from "@playwright/test";
import { prototypeCatalog } from "../../packages/catalog/src/catalog";

test("all 48 catalog records resolve to one live detail route and source", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns catalog route coverage.");
  test.setTimeout(180_000);
  expect(prototypeCatalog).toHaveLength(48);

  for (const item of prototypeCatalog) {
    await page.goto(`/charts/${item.id}?system=digital`, { waitUntil: "domcontentloaded" });
    const detail = page.locator(`[data-library-detail="${item.id}"]`);
    await expect(detail).toBeVisible();
    await expect(detail.locator(".detail-stage iframe")).toHaveAttribute("src", new RegExp(`template=${item.id}.*theme=digital`));
    await expect(detail.locator(".detail-documentation article").first().locator("code")).not.toBeEmpty();
    await expect(detail.getByRole("link", { name: "OPEN GITHUB SOURCE" })).toHaveAttribute("href", new RegExp(item.githubPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
  }
});
