// backend/routes/admin.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// ==============================
// 🧠 Admin Login
// ==============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: "Admin not found" });

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "2h" }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==============================
// 🔍 Check Users Table Structure
// ==============================
router.get("/check-users-table", async (req, res) => {
  try {
    const [columns] = await db.query("DESCRIBE users");
    const [sampleData] = await db.query("SELECT * FROM users LIMIT 5");
    res.json({ success: true, columns, sampleData });
  } catch (err) {
    console.error("Error checking users table:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================
// 👥 Fetch All Registered Customers (with hardcoded order + spend data)
// ==============================
router.get("/all-customers", async (req, res) => {
  try {
    console.log("📋 Fetching all customers (with dummy totals)...");

    const [rows] = await db.query("SELECT id, name, email FROM users");

    // Add fake total_orders & total_spent values for demo
    const customers = rows.map((c, i) => ({
      id: c.id,
      name: c.name || "Unknown",
      email: c.email || "—",
      join_date: new Date().toISOString().split("T")[0],
      total_orders: (i + 1) * 2, // e.g., 2, 4, 6, ...
      total_spent: (i + 1) * 850, // e.g., ₹850, ₹1700, ₹2550, ...
      status: "Active",
    }));

    console.log(`✅ ${customers.length} customers fetched successfully`);
    res.json({ success: true, data: customers });
  } catch (err) {
    console.error("❌ ERROR in /all-customers route:", err);
    res.status(500).json({
      success: false,
      message: "Database query failed",
      error: err.sqlMessage || err.message,
    });
  }
});

// ==============================
// 📦 Fetch All Customer Orders (Mock Data)
// ==============================
router.get("/customers", async (req, res) => {
  try {
    console.log("📦 Fetching all customer orders (mock data)");

    const mockOrders = [
      {
        order_id: 1001,
        name: "Priya Sharma",
        email: "priya.sharma@email.com",
        total: 1250,
        items: [{ name: "Oat Cookies", quantity: 2 }],
        created_at: new Date('2025-01-12'),
      },
      {
        order_id: 1002,
        name: "Rahul Verma",
        email: "rahul.verma@email.com",
        total: 680,
        items: [{ name: "Brownies", quantity: 1 }],
        created_at: new Date('2025-02-10'),
      },
      {
        order_id: 1003,
        name: "Rashi Patel",
        email: "rashi.patel@email.com",
        total: 1450,
        items: [{ name: "Choco Cookies", quantity: 3 }],
        created_at: new Date('2025-03-05'),
      },
    ];

    res.json({ success: true, data: mockOrders });
  } catch (err) {
    console.error("❌ Error fetching mock orders:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;