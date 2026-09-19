# Shopfront — Ecommerce Demo (React + Express + Postgres or TiDB)

An ecommerce demo. The product catalog and orders are persisted in a SQL
database — either Neon Serverless Postgres or TiDB Cloud (MySQL-compatible),
auto-detected from `DATABASE_URL`; the live cart stays in the browser's
`localStorage` until checkout. Authentication (email + password, via
[Better Auth](https://www.better-auth.com/)) is optional — checkout works
both logged in and as a guest.

## Set up the database

The database engine is picked automatically from the scheme of `DATABASE_URL`
(`postgres://` / `postgresql://` vs `mysql://`) in `server/db.js` — no other
config needed.

### Option A: Postgres via Neon (free tier)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string from the project dashboard.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to that connection string.

### Option B: TiDB via TiDB Cloud (free tier, MySQL-compatible)

1. Create a free Starter/Serverless cluster at [tidbcloud.com](https://tidbcloud.com).
2. Open the cluster's **Connect** dialog for the host, port (`4000`), user, and
   password.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to
   `mysql://<user>:<password>@<host>:4000/<database>`. TLS is required by TiDB
   Cloud's public endpoint and is enabled automatically by `server/db.js` — no
   extra `ssl` config needed in the connection string.

### Set up authentication

Also in `.env`, set `BETTER_AUTH_SECRET` (a random signing key, e.g.
`openssl rand -base64 32` — anyone with it can forge sessions) and
`BETTER_AUTH_URL` (the app's own base URL, e.g. `http://localhost:3000`).
Authentication is optional for shoppers — checkout works whether or not
they're logged in — but Better Auth itself needs both variables set.

### Seed the schema and product catalog

```bash
npm install
npm run db:setup
```

This creates the `products` and `orders` tables (if they don't exist) and
seeds the catalog from `src/data/products.js`. Safe to re-run.

## Run it

```bash
npm run dev
```

This starts a single Node process (Express + Vite in middleware mode, for HMR)
at http://localhost:3000, serving both the app and its `/api/*` routes.

## Deploy

The app ships as a single Node process — build the frontend, then let the
Express server (`server/index.js`) serve it and the API together:

```bash
npm install
npm run build
npm start
```

This serves the whole app at http://localhost:3000 (set `PORT` to change it).
There's no separate frontend/backend to run or deploy — one process, one
artifact. Set `DATABASE_URL` in the deploy environment the same way as local dev.

## What's here

- **Home** (`/`) — product grid with search and category filter
- **Product detail** (`/product/:id`) — description, stock, quantity + add to cart
- **Cart** (`/cart`) — update quantity, remove items, subtotal/total
- **Checkout** (`/checkout`) — shipping form, places a real order via the API (no payment)
- **Order confirmation** (`/order-confirmation`) — shows the order ID returned by the API
- **Login** (`/login`) / **Signup** (`/signup`) — email + password via Better Auth; optional,
  checkout works as a guest too

## Where things live

- `src/data/products.js` — product catalog; also used as the seed source for
  `npm run db:setup`.
- `src/context/ProductsContext.jsx` — fetches `/api/products` once and exposes
  `products`/`getProductById` to the rest of the app.
- `src/context/CartContext.jsx` — cart state (add/update/remove/clear/placeOrder), synced to
  `localStorage` under the `ecommerce_cart` key. `placeOrder` posts to `/api/orders`.
- `src/api/` — `fetch()` wrappers for the products and orders endpoints.
- `src/pages/` — one file per route, each with its own CSS module.
- `src/components/` — shared UI: `Header`, `ProductCard`, `QuantityStepper`.
- `server/app.js` — Express app: JSON body parsing + `/api/products`, `/api/orders`.
- `server/index.js` — production entry: serves the built `dist/` + the API.
- `server/dev.js` — dev entry: same API, with Vite in middleware mode for HMR.
- `server/db.js` — connection pool; picks Postgres or MySQL/TiDB based on `DATABASE_URL`'s
  scheme and exposes both behind the same `pool.query()` shape.
- `server/db/` — schema (`schema.sql` for Postgres, `schema.mysql.sql` for MySQL/TiDB) and the
  seed script.
- `server/auth.js` — builds the Better Auth instance (email + password) from the raw driver
  pool; mounted at `/api/auth/*splat` in `server/app.js`.
- `src/context/AuthContext.jsx` — wraps Better Auth's React client (`useSession`, `login`,
  `signup`, `logout`) for the rest of the app.

## Extending this later

- Sync the live cart server-side per user now that there's authentication.
