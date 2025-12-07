import express from 'express';
import db from '../../database.js';
import { searchDrinksAutocomplete, searchFoodAutocomplete } from '../../services/apiService.js';

const router = express.Router();

// Autocomplete search endpoint (CUSTOMER ACCESSIBLE)
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.length < 1) {
      return res.json([]);
    }
    
    let results = [];
    if (type === 'Drinks') {
      results = await searchDrinksAutocomplete(q);
      results = results.map(r => ({ ...r, category: 'Drinks' }));
    } else if (type === 'Food') {
      results = await searchFoodAutocomplete(q);
      results = results.map(r => ({ ...r, category: 'Food' }));
    } else {
      const [drinks, food] = await Promise.all([
        searchDrinksAutocomplete(q),
        searchFoodAutocomplete(q)
      ]);
      results = [
        ...drinks.map(r => ({ ...r, category: 'Drinks' })),
        ...food.map(r => ({ ...r, category: 'Food' }))
      ];
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (CUSTOMER ACCESSIBLE - with filters)
router.get('/', async (req, res) => {
  try {
    const { category, available, search, mostOrdered } = req.query;
    
    let query = `SELECT p.* FROM products p`;
    
    // If mostOrdered is requested, join with order_items to get sales count
    if (mostOrdered === 'true') {
      query += ` LEFT JOIN order_items oi ON p.product_id = oi.product_id
        WHERE p.product_is_available = 1
        GROUP BY p.product_id
        ORDER BY SUM(oi.order_item_quantity) DESC
        LIMIT 6`;
      const products = await db.allAsync(query);
      return res.json(products);
    }
    
    query += ' WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND p.product_category = ?';
      params.push(category);
    }

    if (available !== undefined) {
      query += ' AND p.product_is_available = ?';
      params.push(available === 'true' ? 1 : 0);
    }

    if (search) {
      query += ' AND p.product_name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.product_created_at DESC';

    const products = await db.allAsync(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID (CUSTOMER ACCESSIBLE)
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getAsync(`SELECT p.* FROM products p WHERE p.product_id = ?`, [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
