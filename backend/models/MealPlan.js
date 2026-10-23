import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Gluten-Free", "Keto", "Vegan", "High-Protein"],
      default: "High-Protein",
    },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export default MealPlan;
