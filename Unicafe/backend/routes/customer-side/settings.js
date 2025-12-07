import express from "express";
import db from "../../database.js";

const router = express.Router();

// Get store settings (public endpoint for customers)
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

export default router;
