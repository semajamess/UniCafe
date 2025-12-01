import express from "express";
import db from "../../database.js";

const router = express.Router();

// Get all categories (CUSTOMER ACCESSIBLE)
router.get("/", async (req, res) => {
  try {
    const categories = await db.allAsync(`
      SELECT DISTINCT product_category as name, product_category as id
      FROM products
      WHERE product_category IS NOT NULL
      ORDER BY product_category
    `);

    if (categories.length === 0) {
      return res.json([
        { id: "Drinks", name: "Drinks" },
        { id: "Food", name: "Food" },
      ]);
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID (CUSTOMER ACCESSIBLE)
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await db.getAsync(
      "SELECT DISTINCT product_category as name, product_category as id FROM products WHERE product_category = ?",
      [id]
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
