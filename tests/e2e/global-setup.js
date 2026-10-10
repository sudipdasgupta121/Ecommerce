import { prepareTestDatabase } from "./prepare-test-db.js";

// Safety net inside the test runner's own lifecycle. The real ordering guarantee — that the
// test DB's schema exists before the app process starts — comes from webServer.command in
// playwright.config.js chaining prepare-test-db.js *before* npm run build/start, since
// globalSetup and webServer are otherwise started concurrently by Playwright.
export default async function globalSetup() {
  await prepareTestDatabase();
}
