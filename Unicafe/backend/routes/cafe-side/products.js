import express from 'express';
import db from '../../database.js';

const router = express.Router();

// Check if product exists
router.get('/check-exists', async (req, res) => {
  try {
    const { name } = req.query;
    const product = await db.getAsync(
      `SELECT p.* FROM products p WHERE p.product_name = ?`,
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

// Get deactivated products
router.get('/deactivated', async (req, res) => {
  try {
    const { q } = req.query;
    const products = await db.allAsync(
      `SELECT p.* FROM products p WHERE p.product_is_available = 0 AND p.product_name LIKE ? LIMIT 5`,
      [`%${q}%`]
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products (ADMIN VIEW)
router.get('/', async (req, res) => {
  try {
    const { category, available, search } = req.query;
    
    let query = `SELECT p.* FROM products p WHERE 1=1`;
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

// Get product by ID
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

// Create product (ADMIN ONLY)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, image_url, is_available } = req.body;
    
    let category = req.body.category;
    if (!category) category = 'Food';

    const result = await db.runAsync(
      `INSERT INTO products (product_category, product_name, product_description, product_price, product_stock, product_image_url, product_is_available) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category, name, description, price, stock || 0, image_url, is_available !== undefined ? is_available : 1]
    );

    res.status(201).json({ 
      product_id: result.lastID, 
      product_category: category, 
      product_name: name, 
      product_description: description, 
      product_price: price,
      product_stock: stock, 
      product_image_url: image_url, 
      product_is_available: is_available
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (ADMIN ONLY)
router.put('/:id', async (req, res) => {
  try {
    const { category, name, description, price, stock, image_url, is_available } = req.body;

    await db.runAsync(
      `UPDATE products 
       SET product_category = ?, product_name = ?, product_description = ?, product_price = ?, product_stock = ?, product_image_url = ?, product_is_available = ? 
       WHERE product_id = ?`,
      [category, name, description, price, stock, image_url, is_available, req.params.id]
    );

    res.json({ product_id: req.params.id, product_category: category, product_name: name, product_description: description, product_price: price, product_stock: stock, product_image_url: image_url, product_is_available: is_available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM products WHERE product_id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
