import express from "express";
import db from "../../database.js";

const router = express.Router();

// Initialize notifications table
const initNotificationsTable = async () => {
  try {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        notification_type TEXT NOT NULL,
        notification_title TEXT NOT NULL,
        notification_message TEXT NOT NULL,
        notification_data TEXT,
        notification_is_read BOOLEAN DEFAULT 0,
        notification_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Notifications table ready");
  } catch (error) {
    console.error("❌ Error creating notifications table:", error);
  }
};

// Initialize on module load
initNotificationsTable();

// Get all notifications (newest first)
router.get("/", async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;

    let query = `
      SELECT * FROM notifications
      ${unreadOnly === "true" ? "WHERE notification_is_read = 0" : ""}
      ORDER BY notification_created_at DESC
      LIMIT ?
    `;

    const notifications = await db.allAsync(query, [parseInt(limit)]);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get("/unread-count", async (req, res) => {
  try {
    const result = await db.getAsync(
      "SELECT COUNT(*) as count FROM notifications WHERE notification_is_read = 0"
    );
    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req, res) => {
  try {
    await db.runAsync(
      "UPDATE notifications SET notification_is_read = 1 WHERE notification_id = ?",
      [req.params.id]
    );
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", async (req, res) => {
  try {
    await db.runAsync("UPDATE notifications SET notification_is_read = 1");
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
  try {
    await db.runAsync("DELETE FROM notifications WHERE notification_id = ?", [
      req.params.id,
    ]);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all notifications
router.delete("/", async (req, res) => {
  try {
    await db.runAsync("DELETE FROM notifications");
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to create and emit notification
export const createNotification = async (
  io,
  { type, title, message, data = null }
) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO notifications (notification_type, notification_title, notification_message, notification_data)
       VALUES (?, ?, ?, ?)`,
      [type, title, message, data ? JSON.stringify(data) : null]
    );

    const notification = await db.getAsync(
      "SELECT * FROM notifications WHERE notification_id = ?",
      [result.lastID]
    );

    // Emit to all connected cafe admins
    if (io) {
      io.to("cafe-admins").emit("notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export default router;
