import express from "express";
import db from "../db.js";

const router = express.Router();

// ==============================
// 🧁 POST: Create a new order
// ==============================
router.post("/", (req, res) => {
  const { user_id, total, items } = req.body;
  const query = "INSERT INTO orders (user_id, total, items) VALUES (?, ?, ?)";
  
  db.query(query, [user_id, total, JSON.stringify(items)], (err) => {
    if (err) {
      console.error("❌ Error creating order:", err);
      return res.status(500).json({ error: "Failed to place order" });
    }
    res.json({ success: true, message: "Order placed successfully!" });
  });
});

// ==============================
// 📦 GET: All orders (for Admin Dashboard)
// ==============================
router.get("/", (req, res) => {
  const query = `
    SELECT 
      o.id AS order_id,
      u.name AS customer_name,
      u.email AS customer_email,
      o.total AS amount_paid,
      o.items,
      o.created_at
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching orders:", err);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
    res.json(results);
  });
});

export default router;