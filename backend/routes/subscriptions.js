// backend/routes/subscriptions.js
import express from "express";
import { createSubscription } from "../store.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST new subscription (works with MySQL or the in-memory demo store).
router.post("/", async (req, res) => {
  try {
    const { name, email, address, city, pincode, plan, price } = req.body;

    if (!name || !email || !plan)
      return res.status(400).json({ error: "Name, email and plan are required" });
    if (!EMAIL_RE.test(String(email)))
      return res.status(400).json({ error: "Please enter a valid email address" });

    await createSubscription({ name, email, address, city, pincode, plan, price });
    res.json({ success: true, message: "Subscription saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

export default router;
