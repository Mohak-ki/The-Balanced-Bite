// backend/routes/products.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// ✅ Get all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;