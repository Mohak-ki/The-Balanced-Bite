// backend/routes/users.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "supersecretcookie";

// ============================
// 🧸 SIGN UP
// ============================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.json({ success: false, message: "All fields required" });

    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.json({ success: false, message: "User already registered" });

    const hashedPass = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPass]
    );

    const token = jwt.sign({ id: result.insertId, email }, SECRET, { expiresIn: "2h" });

    res.json({
      success: true,
      message: "User registered successfully!",
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
});

// ============================
// 🍪 SIGN IN
// ============================
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ success: false, message: "All fields required" });

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email }, SECRET, { expiresIn: "2h" });

    res.json({ success: true, message: "Login successful!", token });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ success: false, message: "Server error during signin" });
  }
});

export default router;