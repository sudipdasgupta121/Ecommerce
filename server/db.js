import "dotenv/config";
import { Pool } from "pg";
import mysql from "mysql2/promise";

function detectDialect(connectionString) {
  return /^mysql2?:\/\//.test(connectionString) ? "mysql" : "postgres";
}

function createPostgresPool(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  // pg.Pool already satisfies both the app's pool.query(text, params) shape and what a
  // Kysely PostgresDialect needs, so the same object serves as both.
  return { pool, rawPool: pool };
}

// TiDB Cloud (and most other hosted MySQL-compatible free tiers) require TLS on
// their public endpoint, so it's forced on here rather than left to the connection
// string's query params.
function createMysqlPool(connectionString) {
  const url = new URL(connectionString);
  const raw = mysql.createPool({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    multipleStatements: true,
  });

  const pool = {
    async query(text, params = []) {
      // Queries in this codebase are written with Postgres-style $1, $2, ... placeholders,
      // each used exactly once in order, so a straight positional rewrite to `?` is safe.
      const [rows] = await raw.query(text.replace(/\$\d+/g, "?"), params);
      return { rows };
    },
    end: () => raw.end(),
  };
  // Kysely's MysqlDialect needs the real mysql2 pool, not the $-placeholder-rewriting
  // wrapper above, so both are exposed.
  return { pool, rawPool: raw };
}

// Builds a { dialect, pool, rawPool } set for an arbitrary connection string. Used directly by
// server/db/migrate.js, which needs a source and a target pool open at once.
export function createPool(connectionString) {
  const dialect = detectDialect(connectionString);
  const { pool, rawPool } =
    dialect === "mysql" ? createMysqlPool(connectionString) : createPostgresPool(connectionString);
  return { dialect, pool, rawPool };
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and add a Postgres or MySQL/TiDB connection string."
  );
}

export const { dialect, pool, rawPool } = createPool(process.env.DATABASE_URL);
