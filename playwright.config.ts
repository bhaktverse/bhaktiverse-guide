import { defineConfig, devices } from "@playwright/test";

const localBrowser = process.env.PLAYWRIGHT_EXECUTABLE_PATH || (!process.env.CI ? "/bin/chromium" : undefined);
const runningAsRoot = typeof process.getuid === "function" && process.getuid() === 0;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["line"]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 1280, height: 1800 },
    colorScheme: "dark",
    trace: "retain-on-failure",
    launchOptions: {
      ...(localBrowser ? { executablePath: localBrowser } : {}),
      ...(runningAsRoot ? { args: ["--no-sandbox"] } : {}),
    },
  },
  webServer: {
    command: "bun run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});