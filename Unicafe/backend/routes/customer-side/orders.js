import express from "express";
import db from "../../database.js";
import { authenticateToken } from "./auth.js";
import { createNotification } from "../cafe-side/notifications.js";
import { createCustomerNotification } from "./notifications.js";

const router = express.Router();

// Get user's own orders (CUSTOMER CAN SEE THEIR OWN ORDERS)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!user_id) {
      return res.status(401).json({ error: "User ID required" });
    }

    let query = `
      SELECT o.*, 
        u.user_username,
        u.user_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as item_count,
        (SELECT payment_method FROM payments WHERE order_id = o.order_id ORDER BY payment_id DESC LIMIT 1) AS payment_method,
        (SELECT payment_amount FROM payments WHERE order_id = o.order_id ORDER BY payment_id DESC LIMIT 1) AS payment_amount,
        (SELECT payment_id FROM payments WHERE order_id = o.order_id ORDER BY payment_id DESC LIMIT 1) AS payment_id
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.user_id
      WHERE o.user_id = ?
    `;

    const { status } = req.query;
    let params = [user_id];

    if (status) {
      query += " AND o.order_status = ?";
      params.push(status);
    }

    query += " ORDER BY o.order_created_at DESC";

    const orders = await db.allAsync(query, params);

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db.allAsync(
          "SELECT * FROM order_items WHERE order_id = ?",
          [order.order_id]
        );
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific order by ID (CUSTOMER CAN VIEW THEIR OWN ORDERS)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!user_id) {
      return res.status(401).json({ error: "User ID required" });
    }

    const order = await db.getAsync(
      "SELECT o.*, u.user_username, u.user_email FROM orders o LEFT JOIN users u ON o.user_id = u.user_id WHERE o.order_id = ? AND o.user_id = ?",
      [req.params.id, user_id]
    );

    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or not authorized" });
    }

    const items = await db.allAsync(
      "SELECT * FROM order_items WHERE order_id = ?",
      [req.params.id]
    );
    const latestPayment = await db.getAsync(
      "SELECT * FROM payments WHERE order_id = ? ORDER BY payment_id DESC LIMIT 1",
      [req.params.id]
    );

    res.json({
      ...order,
      items,
      payment: latestPayment || null,
      payment_id: latestPayment ? latestPayment.payment_id : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order (CUSTOMER CAN CREATE ORDERS)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { items, payment_method, payment_metadata, provider_txn_id } =
      req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Authenticated user required to create orders" });
    }

    // Calculate total
    let total = 0;
    const productDetails = [];

    for (const item of items) {
      const product = await db.getAsync(
        "SELECT * FROM products WHERE product_id = ?",
        [item.product_id]
      );
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product ${item.product_id} not found` });
      }
      productDetails.push({ ...product, quantity: item.quantity });
      total += product.product_price * item.quantity;
    }

    // Create order linked to authenticated user
    const orderResult = await db.runAsync(
      `INSERT INTO orders (user_id, order_total, order_status) 
       VALUES (?, ?, ?)`,
      [user_id, total.toFixed(2), "pending"]
    );

    const orderId = orderResult.lastID;

    // Create order items
    for (const detail of productDetails) {
      await db.runAsync(
        `INSERT INTO order_items (order_id, product_id, order_item_product_name, order_item_quantity, order_item_price) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          detail.product_id,
          detail.product_name,
          detail.quantity,
          detail.product_price,
        ]
      );
    }

    // Create payment record if payment info provided
    let paymentId = null;
    if (payment_method) {
      const paymentResult = await db.runAsync(
        `INSERT INTO payments (order_id, payment_amount, payment_method, payment_provider_txn_id, payment_status, payment_metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          total.toFixed(2),
          payment_method,
          provider_txn_id || null,
          "completed",
          payment_metadata ? JSON.stringify(payment_metadata) : null,
        ]
      );
      paymentId = paymentResult.lastID;

      try {
        await db.runAsync(
          "UPDATE orders SET payment_id = ? WHERE order_id = ?",
          [paymentId, orderId]
        );
      } catch (e) {
        // ignore if column does not exist
      }
    }

    // Fetch canonical order including joined user info and items
    const createdOrder = await db.getAsync(
      "SELECT o.*, u.user_username, u.user_email FROM orders o LEFT JOIN users u ON o.user_id = u.user_id WHERE o.order_id = ?",
      [orderId]
    );
    const createdItems = await db.allAsync(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );
    const latestPayment = await db.getAsync(
      "SELECT * FROM payments WHERE order_id = ? ORDER BY payment_id DESC LIMIT 1",
      [orderId]
    );

    // Emit real-time notification to cafe admins
    const io = req.app.get("io");
    if (io) {
      await createNotification(io, {
        type: "new_order",
        title: "New Order Received",
        message: `Order #${orderId} - ₱${total.toFixed(2)} from ${
          createdOrder.user_username || createdOrder.user_email || "Customer"
        }`,
        data: {
          orderId,
          total,
          itemCount: createdItems.length,
          customerName: createdOrder.user_username || createdOrder.user_email,
        },
      });
      console.log("✅ Notification sent for order #" + orderId);

      // Send confirmation notification to the customer
      console.log(
        `🔔 Attempting to send customer notification to user ${user_id} for order #${orderId}`
      );
      const customerNotif = await createCustomerNotification(io, user_id, {
        type: "order_placed",
        title: "Order Placed Successfully! 📝",
        message: `Your order #${orderId} has been placed. Total: ₱${total.toFixed(
          2
        )}. We'll notify you when it's being prepared!`,
        data: {
          orderId,
          total,
          itemCount: createdItems.length,
        },
      });
      if (customerNotif) {
        console.log(
          "✅ Customer notification created and sent for order #" + orderId
        );
      } else {
        console.error(
          "❌ Failed to create customer notification for order #" + orderId
        );
      }
    } else {
      console.warn("⚠️ Socket.IO not available, notification not sent");
    }

    res.status(201).json({
      order: {
        ...createdOrder,
        items: createdItems,
        payment: latestPayment || null,
        payment_id: latestPayment ? latestPayment.payment_id : null,
      },
      message: "Order created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update own order status (CUSTOMER CAN ONLY CANCEL THEIR OWN ORDERS)
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!user_id) {
      return res.status(401).json({ error: "User ID required" });
    }

    // Verify ownership
    const order = await db.getAsync(
      "SELECT user_id FROM orders WHERE order_id = ?",
      [req.params.id]
    );
    if (!order || order.user_id !== user_id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this order" });
    }

    // Only allow cancelling own orders
    if (status !== "cancelled") {
      return res
        .status(400)
        .json({ error: "Customers can only cancel orders" });
    }

    await db.runAsync("UPDATE orders SET order_status = ? WHERE order_id = ?", [
      status,
      req.params.id,
    ]);
    res.json({
      id: req.params.id,
      status,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
