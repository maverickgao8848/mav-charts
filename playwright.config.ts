import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  workers: 4,
  timeout: 180_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
