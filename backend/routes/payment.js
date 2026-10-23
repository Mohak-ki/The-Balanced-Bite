// backend/routes/payment.js
import express from "express";
import Stripe from "stripe";
import config from "../config.js";
import { verifyToken } from "../middleware/auth.js";
import { findProduct } from "../data/catalog.js";

const router = express.Router();

if (!config.stripeSecretKey) {
  console.warn("⚠️  STRIPE_SECRET_KEY is not set — checkout will not work until it is.");
}
const stripe = new Stripe(config.stripeSecretKey || "sk_test_placeholder");

// ✅ Create Checkout Session (must be logged in)
router.post("/create-checkout-session", verifyToken, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Build line items from SERVER-SIDE prices. The price a client sends is
    // ignored entirely — we look each product up by name in the catalogue and
    // charge the real amount, so a tampered cart cannot change the total.
    const lineItems = [];
    for (const item of items) {
      const product = findProduct(item?.name);
      if (!product) {
        return res.status(400).json({ error: `Unknown product: ${item?.name ?? "item"}` });
      }

      const qty = Number(item?.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return res.status(400).json({ error: `Invalid quantity for ${product.name}` });
      }

      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100), // rupees → paise
        },
        quantity: qty,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${config.clientUrl}/success.html`,
      cancel_url: `${config.clientUrl}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Unable to start checkout" });
  }
});

export default router;
