import express from 'express';
import db from '../database.js';
import { searchDrinksAutocomplete, searchFoodAutocomplete } from '../services/apiService.js';

const router = express.Router();

// Autocomplete search endpoint (MUST BE BEFORE /:id)
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.length < 1) {
      return res.json([]);
    }
    
    let results = [];
    if (type === 'Drinks') {
      results = await searchDrinksAutocomplete(q);
      // Add category_id for drinks
      results = results.map(r => ({ ...r, category_id: 1 }));
    } else if (type === 'Food') {
      results = await searchFoodAutocomplete(q);
      // Add category_id for food
      results = results.map(r => ({ ...r, category_id: 2 }));
    } else {
      // Search both
      const [drinks, food] = await Promise.all([
        searchDrinksAutocomplete(q),
        searchFoodAutocomplete(q)
      ]);
      results = [
        ...drinks.map(r => ({ ...r, category_id: 1 })),
        ...food.map(r => ({ ...r, category_id: 2 }))
      ];
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if product exists (including deactivated ones)
router.get('/check-exists', async (req, res) => {
  try {
    const { name } = req.query;
    const product = await db.getAsync(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.name = ?`,
      [name]
    );
    
    if (product) {
      res.json({ exists: true, product });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deactivated products for autocomplete
router.get('/deactivated', async (req, res) => {
  try {
    const { q } = req.query;
    const products = await db.allAsync(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.is_available = 0 AND p.name LIKE ?
       LIMIT 5`,
      [`%${q}%`]
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (CUSTOMER ACCESSIBLE - with filters)
router.get('/', async (req, res) => {
  try {
    const { category, available, search } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND c.name = ?';
      params.push(category);
    }

    if (available !== undefined) {
      query += ' AND p.is_available = ?';
      params.push(available === 'true' ? 1 : 0);
    }

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const products = await db.allAsync(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID (CUSTOMER ACCESSIBLE)
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getAsync(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [req.params.id]
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (ADMIN ONLY)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, image_url, is_available } = req.body;
    
    // Auto-detect category based on product type from API or default to category ID 1 (Drinks) or 2 (Food)
    // You can determine this based on image_url pattern or name keywords
    let category_id = req.body.category_id;
    if (!category_id) {
      // Default to Food category (id: 2) if not specified
      category_id = 2;
    }
    
    const result = await db.runAsync(
      `INSERT INTO products (category_id, name, description, price, stock, image_url, is_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, description, price, stock || 0, image_url, is_available !== undefined ? is_available : 1]
    );
    
    res.status(201).json({ 
      id: result.lastID, 
      category_id, 
      name, 
      description, 
      price,
      stock, 
      image_url, 
      is_available
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (ADMIN ONLY)
router.put('/:id', async (req, res) => {
  try {
    const { category_id, name, description, price, stock, image_url, is_available } = req.body;
    
    await db.runAsync(
      `UPDATE products 
       SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ?, is_available = ? 
       WHERE id = ?`,
      [category_id, name, description, price, stock, image_url, is_available, req.params.id]
    );
    
    res.json({ id: req.params.id, category_id, name, description, price, stock, image_url, is_available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
