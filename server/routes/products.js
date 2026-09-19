import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function toProduct(row) {
  return { ...row, price: Number(row.price) };
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY name");
    res.json(rows.map(toProduct));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Product not found." });
    res.json(toProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
