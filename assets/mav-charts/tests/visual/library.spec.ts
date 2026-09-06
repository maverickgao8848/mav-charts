import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Workbench supports the complete chart selection flow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns cross-viewport workbench coverage.");
  const problems: string[] = [];
  page.on("console", (message) => { if (["error", "warning"].includes(message.type())) problems.push(`${message.type()}: ${message.text()}`); });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?chart=C01", { waitUntil: "networkidle" });
  await expect(page.locator("[data-workbench]")).toBeVisible();
  await expect(page.locator(".wb-film-item")).toHaveCount(48);
  await expect(page.locator('.wb-film-item[aria-selected="true"]')).toContainText("C01");
  await expect(page.locator(".wb-stage iframe")).not.toHaveAttribute("src", /capture/);
  await expect(page.locator(".wb-stage iframe")).toHaveAttribute("src", /durationMs=2900/);
  await expect(page.locator(".wb-usage").first()).toContainText("不同类别中谁更高、谁更低");

  await page.getByPlaceholder("搜索编号、图表或业务问题").fill("桑基");
  await expect(page.locator(".wb-film-item")).toHaveCount(1);
  await expect(page.locator('.wb-film-item[aria-selected="true"]')).toContainText("F02");
  await expect(page).toHaveURL(/chart=F02.*q=%E6%A1%91%E5%9F%BA/);
  await page.getByRole("button", { name: "数字" }).click();
  await expect(page.locator(".wb-stage iframe")).toHaveAttribute("src", /template=F02.*theme=digital.*durationMs=3400/);
  await expect(page).toHaveURL(/system=digital/);
  await page.getByRole("button", { name: "重播" }).click();
  await page.getByRole("button", { name: "暂停" }).click();
  await expect(page.getByRole("button", { name: "播放" })).toBeVisible();
  expect((await new AxeBuilder({ page }).include("[data-workbench]").exclude("iframe").analyze()).violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /使用建议/ }).click();
  await expect(page.getByRole("dialog", { name: "这张图怎么用" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".wb-drawer")).toHaveAttribute("aria-hidden", "true");
  expect(problems).toEqual([]);
});

test("Workbench preserves compatible routes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop owns route smoke coverage.");
  await page.goto("/library?chart=T02&question=trend", { waitUntil: "networkidle" });
  await expect(page.locator("[data-workbench]")).toBeVisible();
  await expect(page.locator('.wb-film-item[aria-selected="true"]')).toContainText("T02");
  await page.goto("/charts/C01?system=signal", { waitUntil: "networkidle" });
  await expect(page.locator('[data-library-detail="C01"]')).toBeVisible();
  await expect(page.locator(".detail-stage iframe")).not.toHaveAttribute("src", /capture/);
  for (const route of ["/collections/finance", "/guides", "/about"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("main.library-shell")).toBeVisible();
  }
});
