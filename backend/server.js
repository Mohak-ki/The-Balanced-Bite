import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import config from "./config.js"; // validates required env vars on import
import paymentRoute from "./routes/payment.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import ordersRoute from "./routes/orders.js";
import productsRoute from "./routes/products.js";
import subscriptionsRoute from "./routes/subscriptions.js";
import mernRoutes from "./routes/mernRoutes.js";

const app = express();

// Restrict cross-origin access to the configured front-end origin instead of
// allowing every site on the internet to call the API from a victim's browser.
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Minimal security headers (helmet-style) without an extra dependency.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  next();
});

app.use(express.json({ limit: "100kb" }));

// MongoDB Connection (used only by the /api/mern meal-planner module)
mongoose
  .connect(config.mongoUri, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log("✅ Connected to MongoDB (MERN meal-planner active)"))
  .catch((err) =>
    console.warn(
      "⚠️  MongoDB not reachable — meal-planner running in in-memory fallback mode " +
        "(writes will not persist across restarts).",
      err.message
    )
  );

// API Routes
app.use("/api/payment", paymentRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/products", productsRoute);
app.use("/api/subscriptions", subscriptionsRoute);
app.use("/api/mern", mernRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

app.get("/", (req, res) => res.sendFile(path.join(publicPath, "index.html")));
app.get("/mern", (req, res) => res.sendFile(path.join(publicPath, "mern-tracker.html")));
app.get("/success.html", (req, res) => res.sendFile(path.join(publicPath, "success.html")));
app.get("/cancel.html", (req, res) => res.sendFile(path.join(publicPath, "cancel.html")));

// Central error handler: log the detail server-side, return a generic message.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Server error" });
});

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`🥗 React MERN App running on http://localhost:${config.port}/mern`);
});
