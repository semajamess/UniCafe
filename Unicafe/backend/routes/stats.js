import express from 'express';
import db from '../database.js';

const router = express.Router();

// Get dashboard statistics (ADMIN ONLY)
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    // Calculate date filter
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND created_at >= date('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND created_at >= date('now', '-30 days')";
    }

    // Total Revenue
    const revenueData = await db.getAsync(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM orders 
      WHERE status != 'cancelled' ${dateFilter}
    `);

    // Previous period revenue for comparison
    let prevDateFilter = '';
    if (period === 'week') {
      prevDateFilter = "AND created_at >= date('now', '-14 days') AND created_at < date('now', '-7 days')";
    } else if (period === 'month') {
      prevDateFilter = "AND created_at >= date('now', '-60 days') AND created_at < date('now', '-30 days')";
    }

    const prevRevenueData = await db.getAsync(`
      SELECT COALESCE(SUM(total), 0) as total, COUNT(*) as count
      FROM orders 
      WHERE status != 'cancelled' ${prevDateFilter}
    `);

    // Calculate percentage change
    const revenueChange = prevRevenueData.total > 0 
      ? (((revenueData.total - prevRevenueData.total) / prevRevenueData.total) * 100).toFixed(1)
      : 0;

    const ordersChange = prevRevenueData.count > 0
      ? (((revenueData.count - prevRevenueData.count) / prevRevenueData.count) * 100).toFixed(1)
      : 0;

    // Total Customers
    const customersData = await db.getAsync(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE 1=1 ${dateFilter.replace('created_at', 'users.created_at')}
    `);

    const prevCustomersData = await db.getAsync(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE 1=1 ${prevDateFilter.replace('created_at', 'users.created_at')}
    `);

    const customersChange = prevCustomersData.total > 0
      ? (((customersData.total - prevCustomersData.total) / prevCustomersData.total) * 100).toFixed(1)
      : 0;

    // Total Products
    const productsData = await db.getAsync(`
      SELECT COUNT(*) as total 
      FROM products 
      WHERE is_available = 1
    `);

    // Revenue over time
    const revenueOverTime = await db.allAsync(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status != 'cancelled' ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Category distribution
    const categoryData = await db.allAsync(`
      SELECT 
        p.category,
        COUNT(oi.id) as itemCount,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${dateFilter.replace('created_at', 'o.created_at')}
      GROUP BY p.category
    `);

    // Top products
    const topProducts = await db.allAsync(`
      SELECT 
        p.name,
        p.category,
        COUNT(oi.id) as sales,
        COALESCE(SUM(oi.price * oi.quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${dateFilter.replace('created_at', 'o.created_at')}
      GROUP BY oi.product_id
      ORDER BY sales DESC
      LIMIT 5
    `);

    // Recent orders
    const recentOrders = await db.allAsync(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        u.username as customer_name,
        u.email as customer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        revenue: {
          value: revenueData.total,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down'
        },
        orders: {
          value: revenueData.count,
          change: ordersChange,
          trend: ordersChange >= 0 ? 'up' : 'down'
        },
        customers: {
          value: customersData.total,
          change: customersChange,
          trend: customersChange >= 0 ? 'up' : 'down'
        },
        products: {
          value: productsData.total,
          change: 0,
          trend: 'neutral'
        }
      },
      revenueOverTime,
      categoryData,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
