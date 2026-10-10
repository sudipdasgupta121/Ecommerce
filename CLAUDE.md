# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Shopfront — an ecommerce demo built with React (frontend) + Express (API) + a SQL database
(product catalog, orders, and Better Auth's user/session tables) that's either Postgres (Neon)
or MySQL-compatible (TiDB Cloud), auto-detected from `DATABASE_URL`. The cart lives in the
browser's `localStorage` and is only sent to the server at checkout. Authentication (email +
password, via Better Auth) is optional — checkout works both logged in and as a guest.

The app ships as **one Node process**: Express serves both the built frontend (`dist/`) and the
`/api/*` routes — there's no separate frontend/backend deploy.

## Commands

```bash
npm run dev        # single dev process: Express + Vite in middleware mode (HMR) at :3000
npm run build      # vite build -> dist/
npm start          # production: node server/index.js, serves dist/ + API
npm run db:setup   # applies the dialect's schema.sql, then seeds `products` from src/data/products.js (idempotent, safe to re-run)
npm run db:inspect # prints dialect, product count, and the 5 most recent orders
npm run db:migrate # copies products + orders from SOURCE_DATABASE_URL to TARGET_DATABASE_URL (e.g. Postgres <-> MySQL/TiDB); leaves DATABASE_URL untouched
npm run lint       # oxlint
npm run preview    # vite preview (static preview of the build, no API)
npm run test:e2e   # Playwright UI regression suite, headed, against an isolated test DB+port
npm run test:e2e:debug   # same, under the Playwright Inspector
npm run test:e2e:report  # open the last HTML report (trace/screenshots/video on failure)
npm run test:e2e -- tests/e2e/auth.spec.js           # run a single spec file
npm run test:e2e -- -g "name of test"                # run tests matching a title
```

There is no unit/component test suite configured in this repo. There is a Playwright
end-to-end suite — see "End-to-end tests" below.

### Database setup

Requires `DATABASE_URL` in `.env` (copy from `.env.example`) — either a Neon Postgres **pooled**
connection string, or a MySQL-scheme (`mysql://`) connection string for TiDB Cloud or another
MySQL-compatible free tier. `server/db.js` throws immediately on import if `DATABASE_URL` is
unset. Run `npm run db:setup` after setting it to create/update the `products`, `orders`, and
Better Auth (`user`/`session`/`account`/`verification`) tables and seed the catalog. Also
requires `BETTER_AUTH_SECRET` (session/cookie signing key) and `BETTER_AUTH_URL` in `.env` —
see `.env.example`.

### End-to-end tests

`tests/e2e/` is a Playwright UI regression suite (`npm run test:e2e`), built with the
`e2e-test-suite-ui-playwright` Claude Code skill. It always runs headed (`headless: false`,
non-configurable) and always requires its own `tests/e2e/.env.e2e` with a `TEST_DATABASE_URL`
distinct from this app's real `DATABASE_URL` — `global-setup.js` refuses to run otherwise. It
builds and starts the app on an isolated port (3100 by default) against that test database,
reseeds the product catalog, and resets `orders`/Better Auth tables before every run. See
`tests/e2e/README.md` for the full rundown and what each spec covers.

## Architecture

### One Express app, two entry points

`server/app.js` exports `createApp()`, the shared Express app: Better Auth's handler mounted at
`/api/auth/*splat` (before body parsing — see below), then JSON body parsing, then
`/api/products` + `/api/orders`. Two thin entry points wrap it:
- `server/dev.js` — mounts Vite in middleware mode on top of `createApp()` for HMR during
  development.
- `server/index.js` — serves the static `dist/` build on top of `createApp()`, with an SPA
  fallback (`res.sendFile(dist/index.html)`) for any unmatched non-API route so client-side
  react-router routes resolve on refresh/direct-hit.

When changing API behavior, edit `server/app.js` or the route files under `server/routes/` —
both entry points pick it up automatically.

### Database dialect switch

`server/db.js` inspects `DATABASE_URL`'s scheme and picks a dialect (`postgres` or `mysql`),
exported as `dialect`. Whichever it picks, it exports a `pool` with the same shape either way
(`pool.query(text, params)` returning `{ rows }`, using Postgres-style `$1, $2, ...`
placeholders even for MySQL/TiDB — they're rewritten to `?` internally). Because of this,
`server/routes/products.js` and `server/routes/orders.js` are dialect-agnostic and never branch
on `dialect`. `server/db.js` also exports `createPool(connectionString)`, the factory `pool`/
`dialect` are built from — used directly by `server/db/migrate.js` when it needs a source and a
target pool open at once (potentially different dialects) instead of the ambient `DATABASE_URL`.

The places that do branch on `dialect`: `server/db/setup.js` and `server/db/migrate.js` both pick
between `server/db/schema.sql` (Postgres) and `server/db/schema.mysql.sql` (MySQL/TiDB) to
create tables, and both upsert through `server/db/queries.js`'s `UPSERT_PRODUCT`/`UPSERT_ORDER`,
which hold a Postgres (`ON CONFLICT`) and a MySQL (`ON DUPLICATE KEY UPDATE`) variant of each
statement. When adding a new upsert-style query, add it to `server/db/queries.js` in both
dialects rather than inlining SQL in the script; plain reads/writes elsewhere just use
`$1, $2, ...` placeholders, which work against either dialect unchanged.

### Authentication (Better Auth)

`server/auth.js` builds the `betterAuth()` instance from `rawPool` (see below), email+password
only, secret/baseURL from env. `toNodeHandler(auth)` is mounted at `/api/auth/*splat` in
`server/app.js` **ahead of** `express.json()` — Better Auth needs the raw request stream, so it
must run before the body parser consumes it. `server/routes/orders.js` reads the caller's
session via `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })` and stores
`session?.user?.id ?? null` as the order's `user_id`; a missing session just means a guest
order, not an error, so checkout never requires login.

On the client, `src/lib/authClient.js` creates the `better-auth/react` client (same-origin, no
`baseURL` needed since it's one process), and `src/context/AuthContext.jsx` wraps
`authClient.useSession()` plus `login`/`signup`/`logout` behind the same
createContext/useContext/"must be used within Provider" pattern as `ProductsContext`/
`CartContext`. `AuthProvider` wraps `ProductsProvider`/`CartProvider` in `src/main.jsx`, so
`useAuth()` is available anywhere `useCart()`/`useProducts()` are. `src/pages/LoginPage.jsx` and
`SignupPage.jsx` are the only consumers that call `login`/`signup` directly; `Header.jsx` reads
`user`/`logout` to switch its nav between logged-in/logged-out state, and `CheckoutPage.jsx`
prefills `name`/`email` from `user` when present (still editable, and guest checkout is
unaffected).

### Raw driver pool vs. app pool

`server/db.js`'s `createPool()` returns `{ dialect, pool, rawPool }`: `pool` is the app's
dialect-agnostic `pool.query(text, params)` wrapper described below, while `rawPool` is the
underlying driver object itself (the same `pg.Pool` as `pool` for Postgres; the real `mysql2`
pool, not the `$`-placeholder-rewriting wrapper, for MySQL). `server/auth.js` is the only
consumer of `rawPool` — Better Auth's adapter duck-types the raw driver (`.connect` vs.
`.getConnection`) to build its own Kysely dialect internally, so nothing else in the app needs
to touch `rawPool` or Kysely directly.

### Data flow: SQL database -> API -> React context -> pages

- `server/routes/products.js`, `server/routes/orders.js` — the only two app resources (Better
  Auth's `/api/auth/*` handler is separate — see above). Products are read-only from the
  client's perspective; orders are created but never read back via the API.
- `src/context/ProductsContext.jsx` fetches `/api/products` **once** on mount and exposes
  `products` / `getProductById` app-wide. Pages/components should consume this context rather
  than calling `src/api/products.js` directly.
- `src/context/CartContext.jsx` owns cart state via `useReducer`, persisted to `localStorage`
  under `ecommerce_cart` on every change, and joined against `ProductsContext.getProductById`
  to resolve full product info for display (a cart line pointing at a no-longer-existing product
  is silently dropped). `placeOrder()` posts to `/api/orders` via `src/api/orders.js`, stashes
  the returned order id in `localStorage` (`ecommerce_last_order`, read via `getLastOrder()`),
  then clears the cart.
- Provider order in `src/main.jsx` matters: `AuthProvider` wraps `ProductsProvider`, which wraps
  `CartProvider`, because the cart needs `getProductById`.

### Product catalog seed vs. runtime source

`src/data/products.js` is the catalog's source of truth for **seeding** — `server/db/setup.js`
imports it directly (frontend code imported from a server script) and upserts it into the
database. Once seeded, the running app reads products from the database via `/api/products`,
not from this file. Adding/editing catalog items means editing `src/data/products.js` and
re-running `npm run db:setup`.

### Routing

Single-page app via `react-router-dom`, defined entirely in `src/App.jsx`: `/`, `/product/:id`,
`/cart`, `/checkout`, `/order-confirmation`, `/login`, `/signup`, plus a catch-all 404. `Header`
is rendered outside `<Routes>` so it's present on every page.

### Styling

CSS Modules, one `*.module.css` per page/component, colocated with its `.jsx` file. No global
CSS framework beyond `src/index.css`.
