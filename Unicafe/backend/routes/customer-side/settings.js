import express from "express";
import db from "../../database.js";
import { authenticateToken } from "./auth.js";

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
        store_email: "lukegabriel.arrieta@wvsu.edu.ph",
        store_phone: "+63 912 345 6789",
        store_address: "San Nicolas, Lapaz, Iloilo City",
        order_notifications: true,
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Soft delete user account (customer can deactivate their account)
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    console.log('Delete account request received');
    console.log('User from token:', req.user);
    
    const userId = req.user?.id; // Changed from userId to id
    
    if (!userId) {
      console.log('No userId found in token');
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log(`Deactivating account for user ID: ${userId}`);
    
    // Soft delete by setting deleted_at timestamp
    await db.runAsync(
      "UPDATE users SET user_deleted_at = CURRENT_TIMESTAMP WHERE user_id = ?",
      [userId]
    );

    console.log('Account deactivated successfully');
    
    res.json({ 
      success: true, 
      message: "Account deactivated successfully" 
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to deactivate account" });
  }
});

export default router;
