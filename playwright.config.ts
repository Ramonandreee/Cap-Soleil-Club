import { defineConfig, devices } from "@playwright/test";

// Testes de ponta a ponta contra o site já construído (npm run build),
// servido com os cabeçalhos de public/_headers, inclusive a CSP.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: "http://localhost:4400",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/e2e/serve.mjs 4400",
    url: "http://localhost:4400",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
