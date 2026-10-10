// Headed Chromium, single worker against a dedicated test database — see
// tests/e2e/README.md and the e2e-test-suite-ui-playwright skill for why.
import path from "node:path";
import { defineConfig } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.join(import.meta.dirname, ".env.e2e") });

const PORT = process.env.E2E_PORT || "3100";
const BASE_URL = `http://localhost:${PORT}`;
const APP_ROOT = path.join(import.meta.dirname, "..", "..");

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.js/,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./global-setup.js",
  globalTeardown: "./global-teardown.js",
  use: {
    baseURL: BASE_URL,
    headless: false,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    // Schema setup runs first, in the same shell command, so the app (and Better Auth's own
    // startup schema check) never connects to the test DB before its tables exist — Playwright
    // otherwise starts webServer and globalSetup concurrently, which races the two.
    command: "node tests/e2e/prepare-test-db.js && npm run build && npm run start",
    cwd: APP_ROOT,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
      PORT,
      BETTER_AUTH_URL: BASE_URL,
      BETTER_AUTH_SECRET: process.env.E2E_AUTH_SECRET,
    },
  },
});
