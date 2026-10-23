// backend/store.js
// Data access layer with graceful fallback. If MySQL is reachable it is used;
// otherwise the app runs on an in-memory store so it works out of the box for
// demos and first-time setup (no database install required). In-memory data is
// not persisted across restarts — install MySQL for real persistence.
import db from "./db.js";

let mode = "pending"; // "mysql" | "memory"

// ---- In-memory seed data (used only when MySQL is unavailable) --------------
// Default admin for demos:  admin@balancedbite.com  /  admin123
const mem = {
  users: [
    { id: 1, name: "Priya Sharma", email: "priya@balancedbite.com", password: "$2b$10$j7FZ0rpuvqEuNwVrXTOGkO4Jxo3hq9f7OPErFlHteK135MQN9E7X2" },
    { id: 2, name: "Rahul Verma",  email: "rahul@balancedbite.com", password: "$2b$10$j7FZ0rpuvqEuNwVrXTOGkO4Jxo3hq9f7OPErFlHteK135MQN9E7X2" },
  ],
  admins: [
    { id: 1, email: "admin@balancedbite.com", password: "$2b$10$wLKwYFUAS/nPzymTkfDc3Oe4uwoCRLbE8NqZRgURW0j.WsDe0NQxS" },
  ],
  orders: [
    { id: 1, user_id: 1, total: 1250, items: JSON.stringify([{ name: "Gut-Friendly Oat Cookies", qty: 2 }]), created_at: new Date() },
    { id: 2, user_id: 2, total: 680,  items: JSON.stringify([{ name: "Vegan Brownies", qty: 1 }]), created_at: new Date() },
  ],
  subscriptions: [],
  nextUserId: 3,
  nextOrderId: 3,
  nextSubId: 1,
};

// Decide the mode once, at startup, by trying a quick MySQL query.
const ready = (async () => {
  try {
    await db.query("SELECT 1");
    mode = "mysql";
    console.log("✅ Data store: MySQL connected");
  } catch (err) {
    mode = "memory";
    console.warn("⚠️  Data store: MySQL not reachable — using in-memory demo store.");
    console.warn("    Default admin login →  admin@balancedbite.com  /  admin123");
  }
})();

export function usingMemory() {
  return mode === "memory";
}

// ---- Users ------------------------------------------------------------------
export async function findUserByEmail(email) {
  await ready;
  if (mode === "mysql") {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  }
  return mem.users.find((u) => u.email === email) || null;
}

export async function createUser({ name, email, password }) {
  await ready;
  if (mode === "mysql") {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );
    return { id: result.insertId };
  }
  const user = { id: mem.nextUserId++, name, email, password };
  mem.users.push(user);
  return { id: user.id };
}

// ---- Admins -----------------------------------------------------------------
export async function findAdminByEmail(email) {
  await ready;
  if (mode === "mysql") {
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    return rows[0] || null;
  }
  return mem.admins.find((a) => a.email === email) || null;
}

// ---- Orders -----------------------------------------------------------------
export async function createOrder({ user_id, total, items }) {
  await ready;
  if (mode === "mysql") {
    await db.query("INSERT INTO orders (user_id, total, items) VALUES (?, ?, ?)", [
      user_id,
      total,
      JSON.stringify(items),
    ]);
    return;
  }
  mem.orders.push({
    id: mem.nextOrderId++,
    user_id,
    total,
    items: JSON.stringify(items),
    created_at: new Date(),
  });
}

// Orders joined with the customer name/email, newest first.
export async function listOrdersWithUser() {
  await ready;
  if (mode === "mysql") {
    const [rows] = await db.query(
      `SELECT o.id AS order_id, u.name, u.email, o.total, o.items, o.created_at
         FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC`
    );
    return rows;
  }
  return mem.orders
    .map((o) => {
      const u = mem.users.find((x) => x.id === o.user_id) || {};
      return { order_id: o.id, name: u.name, email: u.email, total: o.total, items: o.items, created_at: o.created_at };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Per-customer aggregates: order count and total spend.
export async function customerAggregates() {
  await ready;
  if (mode === "mysql") {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email,
              COUNT(o.id) AS total_orders,
              COALESCE(SUM(o.total), 0) AS total_spent
         FROM users u LEFT JOIN orders o ON o.user_id = u.id
        GROUP BY u.id, u.name, u.email
        ORDER BY u.id`
    );
    return rows;
  }
  return mem.users.map((u) => {
    const theirOrders = mem.orders.filter((o) => o.user_id === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      total_orders: theirOrders.length,
      total_spent: theirOrders.reduce((s, o) => s + Number(o.total || 0), 0),
    };
  });
}

// ---- Subscriptions ----------------------------------------------------------
export async function createSubscription(sub) {
  await ready;
  if (mode === "mysql") {
    await db.query(
      "INSERT INTO subscriptions (name, email, address, city, pincode, plan, price) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [sub.name, sub.email, sub.address || null, sub.city || null, sub.pincode || null, sub.plan, Number(sub.price) || 0]
    );
    return;
  }
  mem.subscriptions.push({ id: mem.nextSubId++, ...sub, created_at: new Date() });
}

export { ready };
