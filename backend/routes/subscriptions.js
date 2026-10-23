const express = require('express');
const router = express.Router();
const db = require('../db');

// POST new subscription
router.post('/', (req, res) => {
  const { name, email, address, city, pincode, plan, price } = req.body;
  const query = 'INSERT INTO subscriptions (name, email, address, city, pincode, plan, price) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [name, email, address, city, pincode, plan, price], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true, message: 'Subscription saved successfully!' });
  });
});

module.exports = router;
