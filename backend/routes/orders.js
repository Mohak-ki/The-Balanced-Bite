// backend/routes/orders.js
import express from "express";
import db from "../db.js";
import { verifyToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ==============================
// 🧁 POST: Create a new order (must be logged in)
// ==============================
// The owning user is taken from the verified token, not the request body, so a
// caller cannot place an order on someone else's account. Uses the promise API
// (the pool is created with mysql2/promise), which the old callback form broke.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { total, items } = req.body;

    if (typeof total !== "number" || total <= 0)
      return res.status(400).json({ error: "Invalid order total" });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "Order has no items" });

    await db.query("INSERT INTO orders (user_id, total, items) VALUES (?, ?, ?)", [
      req.user.id,
      total,
      JSON.stringify(items),
    ]);

    res.json({ success: true, message: "Order placed successfully!" });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// ==============================
// 📦 GET: All orders (admin only)
// ==============================
router.get("/", requireAdmin, async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT o.id   AS order_id,
              u.name  AS customer_name,
              u.email AS customer_email,
              o.total AS amount_paid,
              o.items,
              o.created_at
         FROM orders o
         JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC`
    );
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
