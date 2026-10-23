// backend/routes/users.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import config from "../config.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

const authLimiter = rateLimit({ max: 15, message: "Too many attempts. Try again later." });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

// ============================
// 🧸 SIGN UP
// ============================
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;

    if (!name || !email || !password)
      return res.json({ success: false, message: "All fields required" });
    if (name.length > 100)
      return res.json({ success: false, message: "Name is too long" });
    if (!EMAIL_RE.test(email))
      return res.json({ success: false, message: "Please enter a valid email address" });
    if (String(password).length < 8)
      return res.json({ success: false, message: "Password must be at least 8 characters" });

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.json({ success: false, message: "User already registered" });

    const hashedPass = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPass]
    );

    const token = signToken({ id: result.insertId, email });

    res.json({
      success: true,
      message: "User registered successfully!",
      token,
      user: { name, email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// ============================
// 🍪 SIGN IN
// ============================
router.post("/signin", authLimiter, async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password)
      return res.json({ success: false, message: "Invalid email or password" });

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid email or password" });

    const token = signToken({ id: user.id, email });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ success: false, message: "Server error during signin" });
  }
});

export default router;
