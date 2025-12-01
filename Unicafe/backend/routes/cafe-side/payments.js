import express from 'express';
import db from '../../database.js';

const router = express.Router();

// Get payment by ID (ADMIN ONLY)
router.get('/:id', async (req, res) => {
  try {
    const payment = await db.getAsync('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all payments (ADMIN ONLY)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT p.*, 
        o.order_id,
        o.order_total,
        u.user_username,
        u.user_email
      FROM payments p
      LEFT JOIN orders o ON p.payment_order_id = o.order_id
      LEFT JOIN users u ON o.order_user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND p.payment_status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.payment_created_at DESC';

    const payments = await db.allAsync(query, params);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
