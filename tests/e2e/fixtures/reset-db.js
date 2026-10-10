import { createPool } from "../../../server/db.js";

// Resets every table the e2e journeys mutate (orders + Better Auth's user/session/account/
// verification) while leaving the seeded product catalog alone. Session/account/verification
// cascade from "user" deletes, but each is cleared explicitly so this doesn't depend on that.
export async function resetTransactionalTables(connectionString) {
  const { pool, dialect } = createPool(connectionString);
  const userTable = dialect === "postgres" ? '"user"' : "user";
  const tables = ["session", "account", "verification", userTable, "orders"];
  for (const table of tables) {
    await pool.query(`DELETE FROM ${table}`);
  }
  await pool.end();
}
