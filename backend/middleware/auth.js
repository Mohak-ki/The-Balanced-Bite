// backend/middleware/auth.js
// Token verification middleware. Every protected route must go through these so
// that issuing a token and trusting a token are no longer two unrelated things.
import jwt from "jsonwebtoken";
import config from "../config.js";

// Pulls the Bearer token off the Authorization header, verifies the signature
// with the single server secret, and attaches the decoded payload to req.user.
export function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Requires a valid token AND an admin role claim. Reuses verifyToken so the
// signature check is never skipped.
export function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  });
}
