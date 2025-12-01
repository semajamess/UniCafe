import express from "express";
import db from "../database.js";

const router = express.Router();

// Get dashboard statistics (ADMIN ONLY)
router.get("/dashboard", async (req, res) => {
  try {
    const { period = "all" } = req.query;

    // Build date filters for current and previous periods
    let currentDateFilter = "";
    let previousDateFilter = "";

    if (period === "week") {
      currentDateFilter = " AND order_created_at >= DATETIME('now', '-7 days')";
      previousDateFilter = " AND order_created_at >= DATETIME('now', '-14 days') AND order_created_at < DATETIME('now', '-7 days')";
    } else if (period === "month") {
      currentDateFilter = " AND order_created_at >= DATETIME('now', '-30 days')";
      previousDateFilter = " AND order_created_at >= DATETIME('now', '-60 days') AND order_created_at < DATETIME('now', '-30 days')";
    }

    // Total Revenue
    const revenueData = await db.getAsync(`
      SELECT COALESCE(SUM(order_total), 0) as total, COUNT(*) as count
      FROM orders 
      WHERE order_status != 'cancelled'${currentDateFilter}
    `);

    // Previous period revenue for comparison
    const prevRevenueData = await db.getAsync(`
      SELECT COALESCE(SUM(order_total), 0) as total, COUNT(*) as count
      FROM orders 
      WHERE order_status != 'cancelled'${previousDateFilter}
    `);

    // Calculate percentage change
    const revenueChange =
      prevRevenueData.total > 0
        ? (
            ((revenueData.total - prevRevenueData.total) /
              prevRevenueData.total) *
            100
          ).toFixed(1)
        : 0;

    const ordersChange =
      prevRevenueData.count > 0
        ? (
            ((revenueData.count - prevRevenueData.count) /
              prevRevenueData.count) *
            100
          ).toFixed(1)
        : 0;

    // Total Customers
    const customersData = await db.getAsync(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE 1=1${currentDateFilter.replace('order_created_at', 'user_created_at')}
    `);

    const prevCustomersData = await db.getAsync(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE 1=1${previousDateFilter.replace('order_created_at', 'user_created_at')}
    `);

    const customersChange =
      prevCustomersData.total > 0
        ? (
            ((customersData.total - prevCustomersData.total) /
              prevCustomersData.total) *
            100
          ).toFixed(1)
        : 0;

    // Total Products
    const productsData = await db.getAsync(`
      SELECT COUNT(*) as total 
      FROM products 
      WHERE product_is_available = 1
    `);

    // Revenue over time
    const revenueOverTime = await db.allAsync(`
      SELECT 
        DATE(order_created_at) as date,
        COALESCE(SUM(order_total), 0) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE order_status != 'cancelled'${currentDateFilter}
      GROUP BY DATE(order_created_at)
      ORDER BY date ASC
    `);

    // Category distribution
    const categoryData = await db.allAsync(`
      SELECT 
        p.product_category as category,
        COUNT(oi.order_item_id) as itemCount,
        COALESCE(SUM(oi.order_item_price * oi.order_item_quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.order_item_product_id = p.product_id
      JOIN orders o ON oi.order_item_order_id = o.order_id
      WHERE o.order_status != 'cancelled'${currentDateFilter.replace('order_created_at', 'o.order_created_at')}
      GROUP BY p.product_category
    `);

    // Top products
    const topProducts = await db.allAsync(`
      SELECT 
        p.product_name as name,
        p.product_category as category,
        COUNT(oi.order_item_id) as sales,
        COALESCE(SUM(oi.order_item_price * oi.order_item_quantity), 0) as revenue
      FROM order_items oi
      JOIN products p ON oi.order_item_product_id = p.product_id
      JOIN orders o ON oi.order_item_order_id = o.order_id
      WHERE o.order_status != 'cancelled'${currentDateFilter.replace('order_created_at', 'o.order_created_at')}
      GROUP BY oi.order_item_product_id
      ORDER BY sales DESC
      LIMIT 5
    `);

    // Recent orders
    const recentOrders = await db.allAsync(`
      SELECT 
        o.order_id as id,
        o.order_total as total,
        o.order_status as status,
        o.order_created_at as created_at,
        u.user_username as customer_name,
        u.user_email as customer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_item_order_id = o.order_id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.order_user_id = u.user_id
      ORDER BY o.order_created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        revenue: {
          value: revenueData.total,
          change: revenueChange,
          trend: revenueChange >= 0 ? "up" : "down",
        },
        orders: {
          value: revenueData.count,
          change: ordersChange,
          trend: ordersChange >= 0 ? "up" : "down",
        },
        customers: {
          value: customersData.total,
          change: customersChange,
          trend: customersChange >= 0 ? "up" : "down",
        },
        products: {
          value: productsData.total,
          change: 0,
          trend: "neutral",
        },
      },
      revenueOverTime,
      categoryData,
      topProducts,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
