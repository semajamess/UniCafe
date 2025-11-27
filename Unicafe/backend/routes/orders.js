import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get all orders (ADMIN can see all, CUSTOMER can filter by email)
router.get('/', async (req, res) => {
  try {
    const { customer_email, status } = req.query;
    
    let query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o 
      WHERE 1=1
    `;
    const params = [];

    // Customer can check their own orders by email (EASY CUSTOMER ACCESS)
    if (customer_email) {
      query += ' AND o.customer_email = ?';
      params.push(customer_email);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = await db.allAsync(query, params);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID with items (CUSTOMER ACCESSIBLE for order tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await db.getAsync('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order (CUSTOMER CAN CREATE ORDERS)
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, items } = req.body;

    // Calculate total
    let total = 0;
    const productDetails = [];

    for (const item of items) {
      const product = await db.getAsync('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.product_id} not found` });
      }
      productDetails.push({ ...product, quantity: item.quantity });
      total += product.price * item.quantity;
    }

    // Create order
    const orderResult = await db.runAsync(
      `INSERT INTO orders (customer_name, customer_email, total, status) 
       VALUES (?, ?, ?, ?)`,
      [customer_name, customer_email, total.toFixed(2), 'pending']
    );

    const orderId = orderResult.lastID;

    // Create order items
    for (const detail of productDetails) {
      await db.runAsync(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, detail.id, detail.name, detail.quantity, detail.price]
      );
    }

    res.status(201).json({ 
      id: orderId, 
      customer_name, 
      customer_email, 
      total: total.toFixed(2), 
      status: 'pending',
      message: 'Order created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (ADMIN ONLY)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ id: req.params.id, status, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    await db.runAsync('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue statistics (ADMIN ONLY)
router.get('/stats/revenue', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND created_at >= date('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= date('now', '-30 days')";
    }

    const stats = await db.getAsync(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        AVG(total) as avg_order_value
      FROM orders 
      WHERE status != 'cancelled' ${dateFilter}
    `);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
