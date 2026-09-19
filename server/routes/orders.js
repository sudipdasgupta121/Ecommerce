import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { pool } from "../db.js";
import { auth } from "../auth.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { items, customer } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must include at least one item." });
    }
    if (!customer?.name || !customer?.email || !customer?.address) {
      return res.status(400).json({ error: "Customer name, email, and address are required." });
    }

    const lineItems = [];
    let subtotal = 0;
    for (const { productId, quantity } of items) {
      const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [productId]);
      const product = rows[0];
      if (!product) return res.status(400).json({ error: `Unknown product: ${productId}` });
      const price = Number(product.price);
      lineItems.push({ productId, name: product.name, price, quantity });
      subtotal += price * quantity;
    }

    // Guest checkout stays supported: userId is null when there's no session.
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    const userId = session?.user?.id ?? null;

    const id = `ORD-${Date.now()}`;
    await pool.query(
      `INSERT INTO orders (id, customer_name, customer_email, customer_address, subtotal, items, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, customer.name, customer.email, customer.address, subtotal, JSON.stringify(lineItems), userId]
    );

    res.status(201).json({ id, subtotal, items: lineItems, customer });
  } catch (err) {
    next(err);
  }
});

export default router;
