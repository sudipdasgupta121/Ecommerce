import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";

export function createApp() {
  const app = express();
  // Mounted before express.json() — Better Auth's handler needs the raw request stream.
  app.all("/api/auth/*splat", toNodeHandler(auth));
  app.use(express.json());
  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);
  return app;
}
