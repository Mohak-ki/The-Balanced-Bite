# 🧁 The Balanced Bite — Healthy & Hearty

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)

**The Balanced Bite** is a premium, full-stack eCommerce platform dedicated to gut-friendly, hormone-balancing, and clean-ingredient bakery treats. Designed for wellness-conscious individuals, it features a seamless shopping experience for PCOS-friendly, gluten-free, and vegan options.

---

## 🚀 Key Features

- **Leafy-Clean Catalog:** Browse a variety of healthy bakes categorized by dietary needs (Gluten-Free, Vegan, No Refined Sugar).
- **Secure Checkout:** Full integration with **Stripe** for safe and reliable payments.
- **User Authentication:** Secure sign-up/sign-in using **JWT** and **Bcrypt** password hashing.
- **Combo Subscriptions:** Special subscription plans for recurring healthy treats.
- **Workshops & Blog:** Community-driven content for healthy living and baking tips.
- **Admin Dashboard:** A dedicated interface for managing products, users, and orders.
- **Responsive Design:** A premium, mobile-first UI built with vanilla CSS.

---

## 🛠 Tech Stack

- **Frontend:** HTML5, Vanilla CSS3, JavaScript (ES6+), Font Awesome, Google Fonts.
- **Backend:** Node.js, Express.js.
- **Database:** MySQL (relational database).
- **Payments:** Stripe API.
- **Tools:** Nodemon, JWT, Dotenv, BcryptJS.

---

## 📋 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MySQL](https://www.mysql.com/) server running.

### 1. Clone the Repository
```bash
git clone https://github.com/gsak-dev/The-Balanced-Bite.git
cd The-Balanced-Bite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Configuration
1. Open your MySQL client.
2. Create a database named `balanced_bite`.
3. Import your table schemas (users, products, orders, subscriptions).

### 4. Run the Application
```bash
# To run in production mode
npm start

# To run in development mode (with nodemon)
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 🔐 Security Note
This project uses a `.gitignore` file to ensure that sensitive information like the `.env` file and `node_modules` are never pushed to GitHub. Always use environment variables for secrets.

---

## 📜 License
This project is licensed under the [ISC License](LICENSE).

---
*Made with ❤️ for a Healthier Gut.*
