import { expect, test } from "@playwright/test";

const systems = ["signal", "editorial", "digital"] as const;

test("renders only the three approved visual systems", async ({ page }) => {
  await page.goto("/?capture&boards=1");
  await page.evaluate(() => document.fonts.ready);

  await expect(page.locator("[data-board]")) .toHaveCount(3);

  for (const system of systems) {
    const board = page.locator(`[data-board="${system}"]`);
    await expect(board).toBeVisible();
    await expect(board).toHaveScreenshot(`${system}.png`, {
      animations: "disabled",
      caret: "hide",
    });
  }
});
