import { expect, test } from "@playwright/test";

test("replay, pause, seek and half speed control actual chart geometry", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?chart=B03&system=signal");
  const frameElement = page.locator(".wb-frame-wrap iframe");
  const frame = page.frameLocator(".wb-frame-wrap iframe");
  await expect(frame.locator('[data-chart-id="B03"] .recharts-bar-rectangle').first()).toBeAttached();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.evaluate(() => window.addEventListener("message", (event) => {
    if (event.data?.type === "mav:preview/time") (window as any).__playbackProgress = event.data.progress;
  }));
  const command = async (type: string, extra = {}) => {
    await frameElement.evaluate((element: HTMLIFrameElement, message) => element.contentWindow!.postMessage({ version: 1, type: `mav:preview/${message.type}`, ...message.extra }, location.origin), { type, extra });
    await page.clock.runFor(32);
  };
  const geometry = () => frame.locator('.recharts-bar-rectangle path').first().getAttribute("d");
  const barHeight = () => frame.locator('.recharts-bar-rectangle path').first().evaluate((path: SVGGraphicsElement) => path.getBBox().height);
  const line = () => frame.locator('.recharts-line-curve').first().getAttribute("stroke-dasharray");
  const sceneProgress = () => page.evaluate(() => (window as any).__playbackProgress);
  await command("seek", { progress: 1 });
  const complete = await geometry();
  await page.getByRole("button", { name: "重播", exact: true }).click();
  await page.clock.runFor(32);
  await command("pause");
  const beginning = await geometry();
  expect(beginning).not.toBe(complete);
  await page.clock.runFor(300);
  expect(await geometry()).toBe(beginning);

  await command("seek", { progress: 0 });
  await command("rate", { rate: 1 });
  await command("play");
  const normalStart = await sceneProgress();
  await page.clock.runFor(160);
  await command("pause");
  const normalDelta = (await sceneProgress()) - normalStart;
  const normalHeight = await barHeight();
  const normalLine = await line();
  await command("seek", { progress: 0 });
  await page.getByRole("button", { name: "0.5×", exact: true }).click();
  await page.clock.runFor(32);
  await command("play");
  const halfStart = await sceneProgress();
  await page.clock.runFor(160);
  await command("pause");
  const halfDelta = (await sceneProgress()) - halfStart;
  expect(halfDelta / normalDelta).toBeCloseTo(0.5, 1);
  expect(await barHeight()).toBeLessThan(normalHeight);
  expect(await line()).not.toBe(normalLine);
  // Seeking to the same scene position must produce exactly the same geometry.
  const half = await geometry();
  const halfLine = await line();
  const progress = await page.evaluate(() => (window as any).__playbackProgress);
  await command("seek", { progress });
  expect(await geometry()).toBe(half);
  expect(await line()).toBe(halfLine);
  await command("seek", { progress: 1 });
  expect(await geometry()).toBe(complete);
  await expect(page.locator('.wb-timeline small')).toHaveText('5.8s / 5.8s');
  await page.getByRole("button", { name: "1×", exact: true }).click();
  await expect(page.locator('.wb-timeline small')).toHaveText('2.9s / 2.9s');
  await command("seek", { progress: 0.5 });
  await page.getByRole("button", { name: "0.5×", exact: true }).click();
  await expect(page.locator('.wb-timeline small')).toHaveText('2.9s / 5.8s');
});
