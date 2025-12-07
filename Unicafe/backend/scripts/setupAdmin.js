import bcrypt from "bcryptjs";
import db from "../database.js";

const setupAdminAndSettings = async () => {
  try {
    console.log("🔄 Setting up admin account and store settings...");

    // Check if admins table has admin_username column
    const adminColumns = await db.allAsync("PRAGMA table_info(admins)");
    const hasUsernameColumn = adminColumns.some(
      (col) => col.name === "admin_username"
    );

    if (!hasUsernameColumn) {
      console.log("📋 Adding admin_username column to admins table...");
      try {
        // Add column without UNIQUE constraint first
        await db.runAsync("ALTER TABLE admins ADD COLUMN admin_username TEXT");
        console.log("✅ Added admin_username column");
      } catch (e) {
        console.warn("⚠️ Could not add admin_username column:", e.message);
      }
    }

    // Create store_settings table if not exists
    console.log("📋 Creating store_settings table...");
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS store_settings (
        setting_id INTEGER PRIMARY KEY,
        store_name TEXT DEFAULT 'UniCafé',
        store_email TEXT DEFAULT 'admin@unicafe.com',
        store_phone TEXT DEFAULT '+1 234 567 8900',
        store_address TEXT DEFAULT '123 Coffee Street, University District',
        order_notifications BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ store_settings table ready");

    // Check if admin123 account exists (check by email since username might not exist)
    const existingAdmin = await db.getAsync(
      "SELECT * FROM admins WHERE admin_email = ?",
      ["admin@unicafe.com"]
    );

    if (!existingAdmin) {
      console.log("📋 Creating admin account...");
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await db.runAsync(
        "INSERT INTO admins (admin_username, admin_email, admin_password, admin_name) VALUES (?, ?, ?, ?)",
        ["admin123", "admin@unicafe.com", hashedPassword, "Admin"]
      );
      console.log(
        "✅ Admin account created: username=admin123, password=admin123"
      );
    } else {
      // Update existing admin to have the username
      console.log("📋 Updating existing admin with username...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.runAsync(
        "UPDATE admins SET admin_username = ?, admin_password = ? WHERE admin_email = ?",
        ["admin123", hashedPassword, "admin@unicafe.com"]
      );
      console.log(
        "✅ Admin account updated: username=admin123, password=admin123"
      );
    }

    // Insert default store settings if not exists
    const existingSettings = await db.getAsync(
      "SELECT * FROM store_settings WHERE setting_id = 1"
    );
    if (!existingSettings) {
      console.log("📋 Creating default store settings...");
      await db.runAsync(
        `INSERT INTO store_settings (setting_id, store_name, store_email, store_phone, store_address, order_notifications) 
         VALUES (1, 'UniCafé', 'admin@unicafe.com', '+1 234 567 8900', '123 Coffee Street, University District', 1)`
      );
      console.log("✅ Default store settings created");
    } else {
      console.log("✅ Store settings already exist");
    }

    console.log("\n✨ Setup complete!");
    console.log("\n📝 Admin Credentials:");
    console.log("   Username: admin123");
    console.log("   Password: admin123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Setup error:", error);
    process.exit(1);
  }
};

// Wait for database connection
setTimeout(setupAdminAndSettings, 1000);
