import express from "express";
import db from "../../database.js";

const router = express.Router();

// Get store settings
router.get("/", async (req, res) => {
  try {
    const settings = await db.getAsync(
      "SELECT * FROM store_settings WHERE setting_id = 1"
    );

    if (!settings) {
      // Return default settings if none exist
      return res.json({
        setting_id: 1,
        store_name: "UniCafé",
        store_email: "admin@unicafe.com",
        store_phone: "+1 234 567 8900",
        store_address: "123 Coffee Street, University District",
        order_notifications: true,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update store settings
router.put("/", async (req, res) => {
  try {
    const { storeName, email, phone, address, orderNotifications } = req.body;

    // Check if settings exist
    const existingSettings = await db.getAsync(
      "SELECT * FROM store_settings WHERE setting_id = 1"
    );

    if (existingSettings) {
      // Update existing settings
      await db.runAsync(
        `UPDATE store_settings SET 
          store_name = ?, 
          store_email = ?, 
          store_phone = ?, 
          store_address = ?, 
          order_notifications = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE setting_id = 1`,
        [storeName, email, phone, address, orderNotifications ? 1 : 0]
      );
    } else {
      // Insert new settings
      await db.runAsync(
        `INSERT INTO store_settings (setting_id, store_name, store_email, store_phone, store_address, order_notifications) 
         VALUES (1, ?, ?, ?, ?, ?)`,
        [storeName, email, phone, address, orderNotifications ? 1 : 0]
      );
    }

    res.json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;
