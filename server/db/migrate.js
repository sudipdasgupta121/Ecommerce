import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createPool } from "../db.js";
import { UPSERT_PRODUCT, UPSERT_ORDER } from "./queries.js";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;

if (!sourceUrl || !targetUrl) {
  throw new Error(
    "Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL (in .env or the environment) to copy data " +
      "from one database into another. DATABASE_URL itself is left alone."
  );
}

function toJson(value) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

async function main() {
  const source = createPool(sourceUrl);
  const target = createPool(targetUrl);

  const schemaFile = target.dialect === "mysql" ? "schema.mysql.sql" : "schema.sql";
  const schema = readFileSync(path.join(import.meta.dirname, schemaFile), "utf-8");
  await target.pool.query(schema);

  const { rows: products } = await source.pool.query("SELECT * FROM products");
  for (const p of products) {
    await target.pool.query(UPSERT_PRODUCT[target.dialect], [
      p.id,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.image,
      p.description,
    ]);
  }

  const { rows: orders } = await source.pool.query("SELECT * FROM orders");
  for (const o of orders) {
    await target.pool.query(UPSERT_ORDER[target.dialect], [
      o.id,
      o.placed_at,
      o.customer_name,
      o.customer_email,
      o.customer_address,
      o.subtotal,
      toJson(o.items),
    ]);
  }

  console.log(
    `Migrated ${products.length} products and ${orders.length} orders from ${source.dialect} to ${target.dialect}.`
  );

  await source.pool.end();
  await target.pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
