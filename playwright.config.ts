import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 1,
  reporter: [["json", { outputFile: "output/results.json" }], ["list"]],
  use: {
    baseURL: "https://demo.playwright.dev/todomvc",
    headless: true,
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
