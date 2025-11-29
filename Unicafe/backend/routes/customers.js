import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all customers with order statistics (ADMIN ONLY)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.created_at,
        COUNT(DISTINCT o.id) as totalOrders,
        COALESCE(SUM(o.total), 0) as totalSpent,
        MAX(o.created_at) as lastOrder
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (u.username LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY totalSpent DESC';

    const customers = await db.allAsync(query, params);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID with detailed order history (ADMIN ONLY)
router.get('/:id', async (req, res) => {
  try {
    const customer = await db.getAsync(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const orders = await db.allAsync(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    const stats = await db.getAsync(
      `SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalSpent,
        MAX(created_at) as lastOrder
      FROM orders 
      WHERE user_id = ? AND status != 'cancelled'`,
      [req.params.id]
    );

    res.json({
      ...customer,
      ...stats,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
