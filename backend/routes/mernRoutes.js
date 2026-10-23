import express from "express";
import mongoose from "mongoose";
import MealPlan from "../models/MealPlan.js";

const router = express.Router();

// Pre-loaded items if local MongoDB daemon isn't running on the college PC
let fallbackMeals = [
  { _id: "6716a1", itemName: "Almond Flour Keto Brownie", category: "Keto", calories: 220, protein: 8, price: 180 },
  { _id: "6716a2", itemName: "Oats & Whey Protein Muffin", category: "High-Protein", calories: 260, protein: 18, price: 150 },
  { _id: "6716a3", itemName: "Dark Chocolate Quinoa Tart", category: "Gluten-Free", calories: 195, protein: 6, price: 210 },
  { _id: "6716a4", itemName: "Chia & Matcha Energy Loaf", category: "Vegan", calories: 210, protein: 7, price: 165 }
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// READ all meals
router.get("/meals", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const count = await MealPlan.countDocuments();
      if (count === 0) {
        await MealPlan.insertMany(fallbackMeals.map(({ _id, ...rest }) => rest));
      }
      const meals = await MealPlan.find().sort({ createdAt: -1 });
      return res.status(200).json(meals);
    }
    res.status(200).json(fallbackMeals);
  } catch (err) {
    res.status(200).json(fallbackMeals);
  }
});

// CREATE a meal
router.post("/meals", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const meal = new MealPlan(req.body);
      const saved = await meal.save();
      return res.status(201).json(saved);
    }
    const newMeal = { _id: Date.now().toString(), ...req.body };
    fallbackMeals.unshift(newMeal);
    res.status(201).json(newMeal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a meal
router.put("/meals/:id", async (req, res) => {
  try {
    if (isMongoConnected()) {
      const updated = await MealPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.status(200).json(updated);
    }
    fallbackMeals = fallbackMeals.map(m => m._id === req.params.id ? { ...m, ...req.body } : m);
    res.status(200).json({ _id: req.params.id, ...req.body });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a meal
router.delete("/meals/:id", async (req, res) => {
  try {
    if (isMongoConnected()) {
      await MealPlan.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: "Deleted from MongoDB" });
    }
    fallbackMeals = fallbackMeals.filter(m => m._id !== req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
