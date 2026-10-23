import React, { useState, useEffect } from "react";

export default function App() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({ itemName: "", category: "High-Protein", calories: "", protein: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchMeals = async () => {
    const res = await fetch("http://localhost:5000/api/mern/meals");
    const data = await res.json();
    setMeals(data);
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/mern/meals/${editingId}` : "/api/mern/meals";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    setForm({ itemName: "", category: "High-Protein", calories: "", protein: "", price: "" });
    fetchMeals();
  };

  return (
    <div className="mern-container">
      <h1>The Balanced Bite - React MERN Module</h1>
      {/* Rendered via /mern-tracker.html */}
    </div>
  );
}
