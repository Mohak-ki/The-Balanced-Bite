// backend/routes/orders.js
import express from "express";
import { verifyToken, requireAdmin } from "../middleware/auth.js";
import { createOrder, listOrdersWithUser } from "../store.js";

const router = express.Router();

// 🧁 POST: Create a new order (must be logged in). The owner comes from the
// verified token, not the request body, so orders can't be placed on someone
// else's account.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { total, items } = req.body;

    if (typeof total !== "number" || total <= 0)
      return res.status(400).json({ error: "Invalid order total" });
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "Order has no items" });

    await createOrder({ user_id: req.user.id, total, items });
    res.json({ success: true, message: "Order placed successfully!" });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 📦 GET: All orders (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const rows = await listOrdersWithUser();
    const results = rows.map((o) => ({
      order_id: o.order_id,
      customer_name: o.name,
      customer_email: o.email,
      amount_paid: o.total,
      items: o.items,
      created_at: o.created_at,
    }));
    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;
