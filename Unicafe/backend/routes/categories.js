import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all categories (CUSTOMER ACCESSIBLE)
router.get('/', async (req, res) => {
  try {
    const categories = await db.allAsync('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID (CUSTOMER ACCESSIBLE)
router.get('/:id', async (req, res) => {
  try {
    const category = await db.getAsync('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (ADMIN ONLY)
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.runAsync(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ id: result.lastID, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category (ADMIN ONLY)
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.runAsync(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    res.json({ id: req.params.id, name, description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
