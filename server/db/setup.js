import { readFileSync } from "node:fs";
import path from "node:path";
import { pool, dialect } from "../db.js";
import { UPSERT_PRODUCT } from "./queries.js";
import { PRODUCTS } from "../../src/data/products.js";

async function main() {
  const schemaFile = dialect === "mysql" ? "schema.mysql.sql" : "schema.sql";
  const schema = readFileSync(path.join(import.meta.dirname, schemaFile), "utf-8");
  await pool.query(schema);

  for (const p of PRODUCTS) {
    await pool.query(UPSERT_PRODUCT[dialect], [
      p.id,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.image,
      p.description,
    ]);
  }

  console.log(`Seeded ${PRODUCTS.length} products.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
