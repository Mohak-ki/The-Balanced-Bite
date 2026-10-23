// backend/routes/subscriptions.js
import express from "express";
import db from "../db.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST new subscription. Converted to ESM + the promise query API (the old
// CommonJS + callback version threw on every request and was never mounted).
router.post("/", async (req, res) => {
  try {
    const { name, email, address, city, pincode, plan, price } = req.body;

    if (!name || !email || !plan)
      return res.status(400).json({ error: "Name, email and plan are required" });
    if (!EMAIL_RE.test(String(email)))
      return res.status(400).json({ error: "Please enter a valid email address" });

    await db.query(
      "INSERT INTO subscriptions (name, email, address, city, pincode, plan, price) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, address || null, city || null, pincode || null, plan, Number(price) || 0]
    );

    res.json({ success: true, message: "Subscription saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

export default router;
