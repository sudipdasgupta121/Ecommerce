# End-to-end tests (Playwright)

A real, repeatable UI regression suite — run it on demand before merging changes. Built with
the `e2e-test-suite-ui-playwright` Claude Code skill.

## The one rule that always applies

**This suite never runs against the app's real database.** Every run needs its own
`tests/e2e/.env.e2e` with a `TEST_DATABASE_URL` that is different from the `DATABASE_URL` in
the app's own `.env`. `global-setup.js` checks this and refuses to run if they match or if
`TEST_DATABASE_URL` is missing. When (re-)asked by Claude for a test database URL, always give
one that is explicitly throwaway — the suite seeds it, then wipes `orders` and the Better Auth
tables (`session`/`account`/`verification`/`user`) before every run. The product catalog is
reseeded idempotently each run, so leave that part to the setup script.

## Running it

```bash
npm run test:e2e           # full run — builds the app, starts it against the test DB, headed Chromium
npm run test:e2e:debug     # Playwright Inspector, step through a spec
npm run test:e2e:report    # open the last HTML report (trace/screenshots/video on failure)
```

Browsers always run **headed** (`headless: false`) — a visible Chromium window pops up during
the run. This is intentional, not a bug, and isn't configurable via env var or CLI flag. It
needs a real display/interactive session; see the skill's `reference/running-and-ci.md` if this
ever needs to run on a headless CI runner (answer: `xvfb-run`, not `headless: true`).

The suite builds the app (`npm run build`) and starts it (`npm run start`) on an isolated port
(`3100` by default, see `.env.e2e`) so it never collides with a developer's already-running
`npm run dev` on port 3000, and never points at the real database.

## What's covered

- `smoke.spec.js` — home page loads and lists products, search filtering, 404 page.
- `browsing-and-cart.spec.js` — product detail view, add to cart, quantity update, remove,
  header cart badge.
- `guest-checkout.spec.js` — full guest checkout to order confirmation, cart cleared
  afterward, required-field validation.
- `auth.spec.js` — sign up, log out, log back in, wrong-password error case.
- `authenticated-checkout.spec.js` — logged-in checkout prefill (name/email from session) and
  order placement.

## Setup (first time, or whenever asked again)

1. Claude will ask for a fresh test database connection string (Postgres/Neon or MySQL/TiDB,
   never this app's real one) every time this suite is run via the skill — not just once.
2. `tests/e2e/.env.e2e` holds `TEST_DATABASE_URL`, `E2E_PORT`, and `E2E_AUTH_SECRET` — gitignored,
   never commit it.
3. `npx playwright install chromium` if browsers aren't installed yet.
