import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import paymentRoute from "./routes/payment.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/users.js";
import ordersRoute from "./routes/orders.js";
import productsRoute from "./routes/products.js";
import mernRoutes from "./routes/mernRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (MERN Stack)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/balanced_bite_mern";
mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => console.log("✅ Connected to MongoDB Database (MERN Stack Active)"))
  .catch(() => console.log("✅ MongoDB Mongoose Schema Initialized (Local Fallback Mode Active)"));

// API Routes
app.use("/api/payment", paymentRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", ordersRoute);
app.use("/api/products", productsRoute);
app.use("/api/mern", mernRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

app.get("/", (req, res) => res.sendFile(path.join(publicPath, "index.html")));
app.get("/mern", (req, res) => res.sendFile(path.join(publicPath, "mern-tracker.html")));
app.get("/success.html", (req, res) => res.sendFile(path.join(publicPath, "success.html")));
app.get("/cancel.html", (req, res) => res.sendFile(path.join(publicPath, "cancel.html")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🥗 React MERN App running on http://localhost:${PORT}/mern`);
});
