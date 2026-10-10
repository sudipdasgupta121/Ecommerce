import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { resetTransactionalTables } from "./fixtures/reset-db.js";

loadEnv({ path: path.join(import.meta.dirname, ".env.e2e") });

const APP_ROOT = path.join(import.meta.dirname, "..", "..");
const THIS_FILE = path.join(import.meta.dirname, "prepare-test-db.js");

function realDatabaseUrl() {
  try {
    const envText = readFileSync(path.join(APP_ROOT, ".env"), "utf-8");
    return envText.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

// Validates the test DB, applies schema+seed, and resets transactional tables. Called from
// both global-setup.js (a safety net inside the test runner) and directly as the first step of
// playwright.config.js's webServer.command — the latter is what actually matters: it guarantees
// the schema exists in the test DB *before* the app process (and Better Auth's own startup
// schema check) ever connects to it, instead of racing globalSetup.
export async function prepareTestDatabase() {
  const testUrl = process.env.TEST_DATABASE_URL;

  if (!testUrl) {
    throw new Error(
      "TEST_DATABASE_URL is not set in tests/e2e/.env.e2e. This suite refuses to run " +
        "without an explicit, dedicated test database — see tests/e2e/README.md."
    );
  }

  const realUrl = realDatabaseUrl();
  if (realUrl && testUrl === realUrl) {
    throw new Error(
      "TEST_DATABASE_URL matches the app's real DATABASE_URL in .env. Refusing to run the " +
        "e2e suite against the real database — use a separate, dedicated test database."
    );
  }

  const result = spawnSync("node", ["server/db/setup.js"], {
    cwd: APP_ROOT,
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error("db:setup against the test database failed — see output above.");
  }

  await resetTransactionalTables(testUrl);
}

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  prepareTestDatabase()
    .then(() => console.log("Test database ready."))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
