// backend/config.js
// Central configuration. Loads environment variables once and validates the
// values the app cannot safely run without, so the server fails loudly at boot
// instead of falling back to insecure defaults at runtime.
import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.error(
      `\n❌ Missing required environment variable: ${name}\n` +
        `   Copy .env.example to .env and fill in the values before starting.\n`
    );
    process.exit(1);
  }
  return value;
}

// JWT_SECRET must be strong and must never have a hardcoded fallback: a
// fallback in source code is a public secret anyone can use to forge tokens.
const JWT_SECRET = required("JWT_SECRET");
if (JWT_SECRET.length < 32) {
  console.error(
    "\n❌ JWT_SECRET is too short. Use at least 32 random characters " +
      "(e.g. `openssl rand -hex 32`).\n"
  );
  process.exit(1);
}

const config = {
  port: process.env.PORT || 5000,
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5000",
  isProd: process.env.NODE_ENV === "production",
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "balanced_bite",
  },
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/balanced_bite_mern",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
};

export default config;
