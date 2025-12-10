import express from "express";
import db from "../../database.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// Initialize customer notifications table
const initCustomerNotificationsTable = async () => {
  try {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS customer_notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        notification_type TEXT NOT NULL,
        notification_title TEXT NOT NULL,
        notification_message TEXT NOT NULL,
        notification_data TEXT,
        notification_is_read BOOLEAN DEFAULT 0,
        notification_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Customer notifications table ready");
  } catch (error) {
    console.error("❌ Error creating customer notifications table:", error);
  }
};

// Initialize on module load
initCustomerNotificationsTable();

// Get all notifications for the logged-in user (newest first)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, unreadOnly = false } = req.query;

    let query = `
      SELECT * FROM customer_notifications
      WHERE user_id = ?
      ${unreadOnly === "true" ? "AND notification_is_read = 0" : ""}
      ORDER BY notification_created_at DESC
      LIMIT ?
    `;

    const notifications = await db.allAsync(query, [userId, parseInt(limit)]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count for logged-in user
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.getAsync(
      "SELECT COUNT(*) as count FROM customer_notifications WHERE user_id = ? AND notification_is_read = 0",
      [userId]
    );
    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Ensure user can only mark their own notifications as read
    await db.runAsync(
      "UPDATE customer_notifications SET notification_is_read = 1 WHERE notification_id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read for logged-in user
router.patch("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.runAsync(
      "UPDATE customer_notifications SET notification_is_read = 1 WHERE user_id = ?",
      [userId]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification (user can only delete their own)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.runAsync(
      "DELETE FROM customer_notifications WHERE notification_id = ? AND user_id = ?",
      [req.params.id, userId]
    );
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all notifications for logged-in user
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.runAsync("DELETE FROM customer_notifications WHERE user_id = ?", [
      userId,
    ]);
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to create and emit customer notification
export const createCustomerNotification = async (
  io,
  userId,
  { type, title, message, data = null }
) => {
  try {
    console.log(
      `📤 Creating customer notification for user ${userId}, type: ${type}`
    );

    const result = await db.runAsync(
      `INSERT INTO customer_notifications (user_id, notification_type, notification_title, notification_message, notification_data)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );

    const notification = await db.getAsync(
      "SELECT * FROM customer_notifications WHERE notification_id = ?",
      [result.lastID]
    );

    console.log(`✅ Customer notification created in DB:`, notification);

    // Emit to specific user's room
    if (io) {
      const roomName = `customer-${userId}`;
      console.log(`🔌 Emitting to room: ${roomName}`);
      io.to(roomName).emit("customer-notification", notification);
      console.log(`✅ Notification emitted to ${roomName}`);
    } else {
      console.warn("⚠️ io is not available");
    }

    return notification;
  } catch (error) {
    console.error("❌ Error creating customer notification:", error);
    return null;
  }
};

// Notification types for reference:
// - order_placed: When order is successfully placed
// - order_preparing: When cafe starts preparing the order
// - order_ready: When order is ready for pickup
// - order_completed: When order is marked as completed
// - order_cancelled: When order is cancelled
// - promo: Promotional notifications
// - welcome: Welcome message for new users

export default router;
