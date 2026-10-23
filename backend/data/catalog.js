// backend/data/catalog.js
// Authoritative product prices (in whole rupees). Checkout totals are computed
// from THIS list, never from the price a browser sends, so a tampered cart
// cannot change what Stripe charges. These mirror the catalogue rendered in the
// public pages; keep them in sync (or, better, move pricing into the products
// table and read it from there).
const PRODUCTS = [
  // Signature bakes (products page)
  { name: "Gut-Friendly Oat Cookies", price: 350 },
  { name: "Vegan Brownies", price: 450 },
  { name: "Clean Ingredient Almond Cake", price: 650 },
  { name: "Probiotic Banana Muffins", price: 380 },
  { name: "DIY Cookie Mix Kit", price: 420 },
  { name: "Healthy Snack Pack", price: 650 },
  { name: "Almond Butter Cookies", price: 360 },
  { name: "Dark Chocolate Brownies", price: 450 },
  { name: "Vegan Carrot Cake", price: 680 },
  { name: "Classic Choco Chip Cookies", price: 330 },
  { name: "Peanut Butter Brownie", price: 470 },
  { name: "Banana Bread Cake", price: 600 },
  { name: "Oatmeal Raisin Cookies", price: 310 },
  { name: "Walnut Brownie", price: 430 },
  { name: "Blueberry Cheesecake", price: 750 },
  { name: "Protein Snack Mix", price: 500 },
  { name: "Hazelnut Cookies", price: 340 },
  { name: "Multigrain Cookies", price: 310 },
  { name: "Salted Caramel Brownie", price: 540 },
  { name: "Strawberry Vanilla Cake", price: 680 },

  // Category / subscription bakes
  { name: "Sugar Free Almond Cookies", price: 320 },
  { name: "Zero Sugar Brownies", price: 420 },
  { name: "Diabetic Friendly Cake", price: 580 },
  { name: "Stevia Sweetened Muffins", price: 350 },
  { name: "Sugar Free Oat Bars", price: 290 },
  { name: "No Sugar Added Cheesecake", price: 680 },
  { name: "100-Calorie Protein Cookies", price: 280 },
  { name: "Airy Rice Cakes", price: 180 },
  { name: "Mini Oat Bites", price: 220 },
  { name: "Protein Energy Balls", price: 260 },
  { name: "Cinnamon Bliss Cookies", price: 350 },
  { name: "Flaxseed Brownies", price: 450 },
  { name: "Inositol Infused Muffins", price: 380 },
  { name: "PCOS Wellness Cookies", price: 320 },
  { name: "Hormone Balance Cake", price: 620 },
  { name: "Spearmint Tea Cookies", price: 300 },

  // Combo / subscription plans
  { name: "Gut Health Starter Combo", price: 650 },
  { name: "PCOS Wellness Combo", price: 950 },
  { name: "Complete Wellness Combo", price: 1200 },
];

const normalize = (s) => String(s || "").trim().toLowerCase();

const byName = new Map(PRODUCTS.map((p) => [normalize(p.name), p]));

// Returns the catalogue entry for a given product name, or null if unknown.
export function findProduct(name) {
  return byName.get(normalize(name)) || null;
}

export default PRODUCTS;
