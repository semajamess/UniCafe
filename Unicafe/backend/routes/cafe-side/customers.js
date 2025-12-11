import express from "express";
import db from "../../database.js";

const router = express.Router();

// Get all customers with statistics (ADMIN ONLY)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        u.user_id,
        u.user_username,
        u.user_email,
        u.user_created_at,
        u.user_profile_image,
        COUNT(DISTINCT o.order_id) as totalOrders,
        COALESCE(SUM(o.order_total), 0) as totalSpent,
        MAX(o.order_created_at) as lastOrder
      FROM users u
      LEFT JOIN orders o ON u.user_id = o.user_id
      WHERE u.user_deleted_at IS NULL
    `;
    const params = [];

    if (search) {
      query += " AND (u.user_username LIKE ? OR u.user_email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " GROUP BY u.user_id, u.user_username, u.user_email, u.user_created_at, u.user_profile_image ORDER BY totalSpent DESC";

    const customers = await db.allAsync(query, params);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID with order history (ADMIN ONLY)
router.get("/:id", async (req, res) => {
  try {
    const customer = await db.getAsync(
      "SELECT user_id, user_username, user_email, user_created_at FROM users WHERE user_id = ? AND user_deleted_at IS NULL",
      [req.params.id]
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const orders = await db.allAsync(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY order_created_at DESC",
      [req.params.id]
    );

    const stats = await db.getAsync(
      `SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(order_total), 0) as totalSpent,
        MAX(order_created_at) as lastOrder
      FROM orders 
      WHERE user_id = ? AND order_status != 'cancelled'`,
      [req.params.id]
    );

    res.json({
      ...customer,
      ...stats,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
