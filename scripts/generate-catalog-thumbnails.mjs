import { spawn } from "node:child_process";
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "public", "catalog");
const outputDirectory = path.join(root, ".catalog-render");
const port = 4177;
const origin = `http://127.0.0.1:${port}`;
const systems = ["signal", "editorial", "digital"];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
const requestedIds = process.argv.slice(2).map((id) => id.toUpperCase());
const ids = [...new Set((await readdir(sourceDirectory))
  .map((name) => name.match(/^([A-Z]\d{2})-signal\.png$/)?.[1])
  .filter(Boolean))].filter((id) => !requestedIds.length || requestedIds.includes(id)).sort();

const server = spawn(process.execPath, [
  path.join(root, "node_modules", "vite", "bin", "vite.js"),
  "--host", "127.0.0.1", "--port", String(port),
], { cwd: root, stdio: "ignore" });

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Vite preview server did not become ready.");
}

try {
  await waitForServer();
  const browser = await chromium.launch();
  const jobs = ids.flatMap((id) => systems.map((system) => ({ id, system })));
  const renderedJobs = [];
  const workerCount = Math.min(4, jobs.length);

  await Promise.all(Array.from({ length: workerCount }, async (_, workerIndex) => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
    for (let index = workerIndex; index < jobs.length; index += workerCount) {
      const { id, system } = jobs[index];
      await page.goto(`${origin}/?template=${id}&theme=${system}&capture`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const chart = page.locator(`[data-chart-id="${id}"]`);
      if (!await chart.count()) {
        console.warn(`Skipped ${id}-${system}: no live preview route.`);
        continue;
      }
      await chart.evaluate((node) => {
        Object.assign(node.style, { width: "960px", height: "624px", flex: "none" });
      });
      await chart.screenshot({
        path: path.join(outputDirectory, `${id}-${system}.png`),
        animations: "disabled",
      });
      renderedJobs.push({ id, system });
    }
    await page.close();
  }));

  await browser.close();
  await Promise.all(renderedJobs.map(({ id, system }) => copyFile(
    path.join(outputDirectory, `${id}-${system}.png`),
    path.join(sourceDirectory, `${id}-${system}.png`),
  )));
  await rm(outputDirectory, { recursive: true, force: true });
  console.log(`Generated ${renderedJobs.length} high-resolution catalog thumbnails at 960x624.`);
} finally {
  server.kill();
}
