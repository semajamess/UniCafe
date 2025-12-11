import express from "express";
import db from "../../database.js";
import { createNotification } from "./notifications.js";

const router = express.Router();

// Search for registered customers (for walk-in who might have an account)
router.get("/customers/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const customers = await db.allAsync(
      `
      SELECT 
        user_id,
        user_username,
        user_email,
        user_phone,
        user_deleted_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.user_id) as order_count,
        (SELECT COALESCE(SUM(order_total), 0) FROM orders WHERE user_id = users.user_id AND order_status != 'cancelled') as total_spent
      FROM users
      WHERE (user_username LIKE ? OR user_email LIKE ? OR user_phone LIKE ?) AND user_role = 'customer'
      LIMIT 10
    `,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );

    res.json(customers);
  } catch (error) {
    console.error("Customer search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all available products for POS
router.get("/products", async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT product_id, product_name, product_category, product_price, product_stock, product_image_url
      FROM products
      WHERE product_is_available = 1
    `;
    const params = [];

    if (category && category !== "all") {
      query += " AND product_category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND product_name LIKE ?";
      params.push(`%${search}%`);
    }

    query += " ORDER BY product_category, product_name";

    const products = await db.allAsync(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a walk-in order with payment
router.post("/order", async (req, res) => {
  try {
    const {
      customerId, // null for guest, user_id for registered customer
      customerName, // "Guest" or actual name
      customerEmail, // optional
      items, // array of { productId, quantity, price, name }
      paymentMethod, // 'cash' | 'gcash' | 'card'
      amountReceived, // for cash payments - amount customer gave
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items in order" });
    }

    // Validate stock for all items
    for (const item of items) {
      const product = await db.getAsync(
        "SELECT product_stock, product_name FROM products WHERE product_id = ?",
        [item.productId]
      );

      if (!product) {
        return res
          .status(400)
          .json({ error: `Product not found: ${item.name}` });
      }

      if (product.product_stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.product_name}. Available: ${product.product_stock}`,
        });
      }
    }

    // Create the order
    const orderResult = await db.runAsync(
      `
      INSERT INTO orders (user_id, order_customer_name, order_customer_email, order_total, order_status, order_created_at)
      VALUES (?, ?, ?, ?, 'completed', datetime('now'))
    `,
      [
        customerId || null,
        customerName || "Walk-in Customer",
        customerEmail || null,
        total,
      ]
    );

    const orderId = orderResult.lastID;

    // Insert order items and update stock
    for (const item of items) {
      await db.runAsync(
        `
        INSERT INTO order_items (order_id, product_id, order_item_product_name, order_item_quantity, order_item_price)
        VALUES (?, ?, ?, ?, ?)
      `,
        [orderId, item.productId, item.name, item.quantity, item.price]
      );

      // Decrease stock
      await db.runAsync(
        `
        UPDATE products SET product_stock = product_stock - ? WHERE product_id = ?
      `,
        [item.quantity, item.productId]
      );
    }

    // Calculate change for cash payments
    const change = paymentMethod === "cash" ? amountReceived - total : 0;

    // Create payment record
    const paymentResult = await db.runAsync(
      `
      INSERT INTO payments (order_id, payment_amount, payment_method, payment_status, payment_metadata, payment_created_at)
      VALUES (?, ?, ?, 'completed', ?, datetime('now'))
    `,
      [
        orderId,
        total,
        paymentMethod,
        JSON.stringify({
          type: "walk-in",
          amountReceived: amountReceived || total,
          change: change,
          processedBy: "cafe-admin",
        }),
      ]
    );

    const paymentId = paymentResult.lastID;

    // Fetch the complete order for receipt
    const order = await db.getAsync(
      `
      SELECT o.*, u.user_username, u.user_email as registered_email, u.user_deleted_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = ?
    `,
      [orderId]
    );

    const orderItems = await db.allAsync(
      `
      SELECT * FROM order_items WHERE order_id = ?
    `,
      [orderId]
    );

    // Emit real-time notification for POS sale
    const io = req.app.get("io");
    await createNotification(io, {
      type: "pos_sale",
      title: "POS Sale Completed",
      message: `Walk-in order #${orderId} - ₱${total.toFixed(
        2
      )} (${paymentMethod.toUpperCase()})`,
      data: {
        orderId,
        total,
        paymentMethod,
        itemCount: items.length,
        customerName: customerName || "Walk-in Customer",
      },
    });

    res.status(201).json({
      success: true,
      order: {
        ...order,
        items: orderItems,
      },
      payment: {
        paymentId,
        method: paymentMethod,
        amountReceived: amountReceived || total,
        change: change,
        total: total,
      },
      message: "Walk-in order completed successfully",
    });
  } catch (error) {
    console.error("POS order error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get today's POS sales summary
router.get("/summary/today", async (req, res) => {
  try {
    const summary = await db.getAsync(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(order_total), 0) as total_revenue,
        COUNT(CASE WHEN user_id IS NULL THEN 1 END) as guest_orders,
        COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as registered_orders
      FROM orders
      WHERE date(order_created_at) = date('now')
        AND order_status = 'completed'
    `);

    const paymentBreakdown = await db.allAsync(`
      SELECT 
        p.payment_method,
        COUNT(*) as count,
        SUM(p.payment_amount) as total
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      WHERE date(o.order_created_at) = date('now')
        AND o.order_status = 'completed'
      GROUP BY p.payment_method
    `);

    res.json({
      ...summary,
      paymentBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent POS orders
router.get("/orders/recent", async (req, res) => {
  try {
    const orders = await db.allAsync(`
      SELECT 
        o.*,
        u.user_username,
        p.payment_method,
        p.payment_metadata,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      LEFT JOIN payments p ON p.order_id = o.order_id
      WHERE date(o.order_created_at) = date('now')
      ORDER BY o.order_created_at DESC
      LIMIT 20
    `);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Void/Cancel a POS order (admin only)
router.post("/order/:id/void", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get the order
    const order = await db.getAsync("SELECT * FROM orders WHERE order_id = ?", [
      id,
    ]);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Restore stock for voided items
    const items = await db.allAsync(
      "SELECT * FROM order_items WHERE order_id = ?",
      [id]
    );

    for (const item of items) {
      await db.runAsync(
        `
        UPDATE products SET product_stock = product_stock + ? WHERE product_id = ?
      `,
        [item.order_item_quantity, item.product_id]
      );
    }

    // Update order status
    await db.runAsync("UPDATE orders SET order_status = ? WHERE order_id = ?", [
      "cancelled",
      id,
    ]);

    // Update payment status
    await db.runAsync(
      `
      UPDATE payments 
      SET payment_status = 'voided', 
          payment_metadata = json_set(COALESCE(payment_metadata, '{}'), '$.voidReason', ?)
      WHERE order_id = ?
    `,
      [reason || "No reason provided", id]
    );

    res.json({ success: true, message: "Order voided successfully" });
  } catch (error) {
    console.error("Void order error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
