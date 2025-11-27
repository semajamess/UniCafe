import express from 'express';
import db from '../database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all orders (ADMIN can see all, CUSTOMER can filter by user_id)
router.get('/', async (req, res) => {
  try {
    const { user_id, status } = req.query;
    
    let query = `
      SELECT o.*, 
        u.username AS username,
        u.email AS user_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT method FROM payments WHERE order_id = o.id ORDER BY id DESC LIMIT 1) AS payment_method,
          (SELECT amount FROM payments WHERE order_id = o.id ORDER BY id DESC LIMIT 1) AS payment_amount,
          (SELECT id FROM payments WHERE order_id = o.id ORDER BY id DESC LIMIT 1) AS payment_id
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Allow filtering by user_id for customer access
    if (user_id) {
      query += ' AND o.user_id = ?';
      params.push(user_id);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = await db.allAsync(query, params);

    // Normalize: prefer denormalized customer_name/customer_email from orders if present,
    // otherwise fall back to joined user_username/user_email
    const normalized = orders.map(o => ({
      ...o,
      // Prefer the username from users table (via user_id). If absent, fall back to any denormalized order fields.
      customer_name: o.username || o.customer_name || null,
      customer_email: o.user_email || o.customer_email || null,
      // Provide a nested customer object for frontends that prefer it
      customer: {
        id: o.user_id || null,
        username: o.username || o.customer_name || null,
        email: o.user_email || o.customer_email || null
      }
      ,
      payment_id: o.payment_id || null,
      payment_method: o.payment_method || null,
      payment_amount: o.payment_amount || null
    }))

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID with items (CUSTOMER ACCESSIBLE for order tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await db.getAsync('SELECT o.*, u.username AS username, u.email AS user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?', [req.params.id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);

    // Fetch latest payment for this order (if any)
    const latestPayment = await db.getAsync('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1', [req.params.id]);

    const normalized = {
      ...order,
      customer_name: order.username || order.customer_name || null,
      customer_email: order.user_email || order.customer_email || null,
    }

    const withCustomer = {
      ...normalized,
      customer: {
        id: order.user_id || null,
        username: order.username || order.customer_name || null,
        email: order.user_email || order.customer_email || null
      },
      payment: latestPayment || null,
      payment_id: latestPayment ? latestPayment.id : null
    }

    res.json({ ...withCustomer, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order (CUSTOMER CAN CREATE ORDERS) - require authentication
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, payment_method, payment_metadata, provider_txn_id } = req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;

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

    // Create order linked to authenticated user
    if (!user_id) return res.status(401).json({ error: 'Authenticated user required to create orders' });

    const orderResult = await db.runAsync(
      `INSERT INTO orders (user_id, total, status) 
       VALUES (?, ?, ?)`,
      [user_id, total.toFixed(2), 'pending']
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

    // Create payment record if payment info provided
    let paymentId = null;
    if (payment_method) {
      const paymentResult = await db.runAsync(
        `INSERT INTO payments (order_id, amount, method, provider_txn_id, status, metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, total.toFixed(2), payment_method, provider_txn_id || null, 'completed', payment_metadata ? JSON.stringify(payment_metadata) : null]
      );
      paymentId = paymentResult.lastID;

      // Attach payment_id to order (if column exists)
      try {
        await db.runAsync('UPDATE orders SET payment_id = ? WHERE id = ?', [paymentId, orderId]);
      } catch (e) {
        // ignore if column does not exist
      }
    }

    // Fetch canonical order including joined user info and items
    const createdOrder = await db.getAsync(
      'SELECT o.*, u.username AS username, u.email AS user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );
    const createdItems = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    // Fetch latest payment for this order (if any) so we can return payment_id
    const latestPayment = await db.getAsync('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1', [orderId]);

    // Normalize customer fields to prefer username from users table
    const normalized = {
      ...createdOrder,
      customer_name: createdOrder && createdOrder.username ? createdOrder.username : (createdOrder && createdOrder.customer_name ? createdOrder.customer_name : null),
      customer_email: createdOrder && createdOrder.user_email ? createdOrder.user_email : (createdOrder && createdOrder.customer_email ? createdOrder.customer_email : null),
      items: createdItems,
      payment: latestPayment || null,
      payment_id: latestPayment ? latestPayment.id : null
    };

    res.status(201).json({ order: normalized, message: 'Order created successfully' });
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
