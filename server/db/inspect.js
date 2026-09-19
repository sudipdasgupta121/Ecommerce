import { pool, dialect } from "../db.js";

async function main() {
  const { rows: productRows } = await pool.query("SELECT COUNT(*) AS count FROM products");
  const { rows: orderRows } = await pool.query(
    "SELECT id, subtotal, placed_at FROM orders ORDER BY placed_at DESC LIMIT 5"
  );

  console.log(`dialect: ${dialect}`);
  console.log(`products: ${productRows[0].count}`);
  console.log(`orders (latest 5 of total):`);
  console.table(orderRows);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
