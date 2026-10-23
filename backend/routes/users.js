// backend/routes/users.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { findUserByEmail, createUser } from "../store.js";

const router = express.Router();

const authLimiter = rateLimit({ max: 50, message: "Too many attempts. Try again later." });

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
    if (String(password).length < 6)
      return res.json({ success: false, message: "Password must be at least 6 characters" });

    const existing = await findUserByEmail(email);
    if (existing)
      return res.json({ success: false, message: "User already registered" });

    const hashedPass = await bcrypt.hash(password, 10);
    const { id } = await createUser({ name, email, password: hashedPass });

    const token = signToken({ id, email });

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

    const user = await findUserByEmail(email);
    if (!user)
      return res.json({ success: false, message: "Invalid email or password" });

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
