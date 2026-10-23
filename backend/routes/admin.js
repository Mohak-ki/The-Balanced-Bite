// backend/routes/admin.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config.js";
import { requireAdmin } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { findAdminByEmail, customerAggregates, listOrdersWithUser } from "../store.js";

const router = express.Router();

// ==============================
// 🧠 Admin Login (public, but rate limited)
// ==============================
const loginLimiter = rateLimit({ max: 50, message: "Too many login attempts. Try again later." });

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // One generic response for every failure case so the endpoint cannot be used
  // to discover which admin emails exist.
  const invalid = () =>
    res.status(401).json({ success: false, message: "Invalid email or password" });

  if (!email || !password) return invalid();

  try {
    const admin = await findAdminByEmail(String(email).trim().toLowerCase());
    if (!admin) return invalid();

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return invalid();

    const token = jwt.sign({ id: admin.id, role: "admin" }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    res.json({ success: true, token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// Everything below requires a valid admin token.
// ==============================
router.use(requireAdmin);

// 👥 All registered customers with real order counts and spend
router.get("/all-customers", async (req, res) => {
  try {
    const rows = await customerAggregates();
    const customers = rows.map((c) => ({
      id: c.id,
      name: c.name || "Unknown",
      email: c.email || "—",
      total_orders: Number(c.total_orders) || 0,
      total_spent: Number(c.total_spent) || 0,
      status: Number(c.total_orders) > 0 ? "Active" : "New",
    }));
    res.json({ success: true, data: customers });
  } catch (err) {
    console.error("❌ ERROR in /all-customers route:", err);
    res.status(500).json({ success: false, message: "Failed to load customers" });
  }
});

// 📦 All customer orders
router.get("/customers", async (req, res) => {
  try {
    const rows = await listOrdersWithUser();
    const orders = rows.map((o) => {
      let items = [];
      try {
        items = typeof o.items === "string" ? JSON.parse(o.items) : o.items || [];
      } catch {
        items = [];
      }
      return {
        order_id: o.order_id,
        name: o.name,
        email: o.email,
        total: Number(o.total) || 0,
        items,
        created_at: o.created_at,
      };
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
});

export default router;
