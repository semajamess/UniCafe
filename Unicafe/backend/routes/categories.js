import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all categories (CUSTOMER ACCESSIBLE)
router.get('/', async (req, res) => {
  try {
    // Categories are now stored as an enum on products. Return the allowed values.
    const categories = [
      { id: 'Drinks', name: 'Drinks' },
      { id: 'Food', name: 'Food' }
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID (CUSTOMER ACCESSIBLE)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const categories = [
      { id: 'Drinks', name: 'Drinks' },
      { id: 'Food', name: 'Food' }
    ];
    const category = categories.find(c => String(c.id) === String(id) || c.name === id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (ADMIN ONLY)
router.post('/', async (req, res) => {
  res.status(403).json({ error: 'Categories are now enum-based. Create/modify categories is not supported.' });
});

// Update category (ADMIN ONLY)
router.put('/:id', async (req, res) => {
  res.status(403).json({ error: 'Categories are now enum-based. Create/modify categories is not supported.' });
});

// Delete category (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
  res.status(403).json({ error: 'Categories are now enum-based. Create/modify categories is not supported.' });
});

export default router;
