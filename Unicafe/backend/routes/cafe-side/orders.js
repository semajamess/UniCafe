import express from "express";
import db from "../../database.js";
import { createNotification } from "./notifications.js";
import { createCustomerNotification } from "../customer-side/notifications.js";

const router = express.Router();

// Get all orders (ADMIN ONLY)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

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
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += " AND o.order_status = ?";
      params.push(status);
    }

    query += " ORDER BY o.order_created_at DESC";

    const orders = await db.allAsync(query, params);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID with details (ADMIN ONLY)
router.get("/:id", async (req, res) => {
  try {
    const order = await db.getAsync(
      "SELECT o.*, u.user_username, u.user_email FROM orders o LEFT JOIN users u ON o.user_id = u.user_id WHERE o.order_id = ?",
      [req.params.id]
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
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

// Update order status (ADMIN ONLY)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`Updating order ${req.params.id} to status: ${status}`);

    if (
      !["pending", "processing", "ready", "completed", "cancelled"].includes(
        status
      )
    ) {
      console.log(`Invalid status rejected: ${status}`);
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await db.runAsync(
      "UPDATE orders SET order_status = ? WHERE order_id = ?",
      [status, req.params.id]
    );
    console.log(`Update result:`, result);

    // Verify the update and get user_id for customer notification
    const updated = await db.getAsync(
      "SELECT order_id, order_status, order_total, user_id FROM orders WHERE order_id = ?",
      [req.params.id]
    );
    console.log(`Updated order:`, updated);

    // Emit notification for status change (optional - for internal tracking)
    const io = req.app.get("io");
    const statusMessages = {
      processing: "is now being prepared",
      ready: "is ready for pickup",
      completed: "has been completed",
      cancelled: "has been cancelled",
    };

    if (statusMessages[status]) {
      // Notification for cafe admins
      await createNotification(io, {
        type: "order_status",
        title: `Order #${req.params.id} Updated`,
        message: `Order #${req.params.id} ${statusMessages[status]}`,
        data: { orderId: req.params.id, status, total: updated?.order_total },
      });

      // Notification for the customer who placed the order
      if (updated?.user_id) {
        const customerMessages = {
          processing: {
            title: "Your Order is Being Prepared! 👨‍🍳",
            message: `Order #${req.params.id} is now being prepared. We'll notify you when it's ready!`,
            type: "order_preparing",
          },
          ready: {
            title: "Your Order is Ready! ✅",
            message: `Order #${req.params.id} is ready for pickup! Please proceed to the counter.`,
            type: "order_ready",
          },
          completed: {
            title: "Order Completed! 🎉",
            message: `Order #${req.params.id} has been completed. Thank you for your order!`,
            type: "order_completed",
          },
          cancelled: {
            title: "Order Cancelled ❌",
            message: `Order #${req.params.id} has been cancelled. Please contact us if you have any questions.`,
            type: "order_cancelled",
          },
        };

        const customerNotif = customerMessages[status];
        if (customerNotif) {
          await createCustomerNotification(io, updated.user_id, {
            type: customerNotif.type,
            title: customerNotif.title,
            message: customerNotif.message,
            data: {
              orderId: req.params.id,
              status,
              total: updated?.order_total,
            },
          });
        }
      }
    }

    res.json({
      id: req.params.id,
      status,
      message: "Order status updated",
      updatedOrder: updated,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete order (ADMIN ONLY)
router.delete("/:id", async (req, res) => {
  try {
    await db.runAsync("DELETE FROM order_items WHERE order_id = ?", [
      req.params.id,
    ]);
    await db.runAsync("DELETE FROM orders WHERE order_id = ?", [req.params.id]);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue statistics (ADMIN ONLY)
router.get("/stats/revenue", async (req, res) => {
  try {
    const { period = "week" } = req.query;

    let dateFilter = "";
    if (period === "week") {
      dateFilter = "AND order_created_at >= date('now', '-7 days')";
    } else if (period === "month") {
      dateFilter = "AND order_created_at >= date('now', '-30 days')";
    }

    const stats = await db.getAsync(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(order_total) as total_revenue,
        AVG(order_total) as avg_order_value
      FROM orders 
      WHERE order_status != 'cancelled' ${dateFilter}
    `);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
