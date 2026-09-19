import { betterAuth } from "better-auth";
import { rawPool } from "./db.js";

// Better Auth detects Postgres vs. MySQL from the shape of the pool itself (pg.Pool has
// .connect, mysql2's pool has .getConnection) and wraps it in the right Kysely dialect.
export const auth = betterAuth({
  database: rawPool,
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});
