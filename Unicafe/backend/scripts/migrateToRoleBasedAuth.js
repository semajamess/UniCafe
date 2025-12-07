import bcrypt from "bcryptjs";
import db from "../database.js";

const migrateToRoleBasedAuth = async () => {
  try {
    console.log("🔄 Starting migration to role-based authentication...");

    // Step 1: Add user_role column to users table
    console.log("📋 Checking users table structure...");
    const userColumns = await db.allAsync("PRAGMA table_info(users)");
    const hasRoleColumn = userColumns.some((col) => col.name === "user_role");

    if (!hasRoleColumn) {
      console.log("📋 Adding user_role column to users table...");
      await db.runAsync(
        "ALTER TABLE users ADD COLUMN user_role TEXT DEFAULT 'customer'"
      );
      console.log("✅ Added user_role column");
    } else {
      console.log("✅ user_role column already exists");
    }

    // Step 2: Set all existing users to 'customer' role (if not already set)
    console.log("📋 Setting existing users to customer role...");
    await db.runAsync(
      "UPDATE users SET user_role = 'customer' WHERE user_role IS NULL OR user_role = ''"
    );
    console.log("✅ Existing users updated to customer role");

    // Step 3: Check if admin123 exists in admins table and migrate to users
    console.log("📋 Checking for admin account to migrate...");

    // First check if admins table exists
    const adminTableExists = await db.getAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='admins'"
    );

    if (adminTableExists) {
      const adminFromAdminsTable = await db.getAsync(
        "SELECT * FROM admins WHERE admin_username = 'admin123' OR admin_email = 'admin@unicafe.com'"
      );

      if (adminFromAdminsTable) {
        console.log(
          "📋 Migrating admin account from admins table to users table..."
        );

        // Check if user already exists in users table
        const existingAdminUser = await db.getAsync(
          "SELECT * FROM users WHERE user_email = ?",
          ["admin@unicafe.com"]
        );

        if (!existingAdminUser) {
          // Insert admin into users table
          await db.runAsync(
            "INSERT INTO users (user_username, user_email, user_password, user_role) VALUES (?, ?, ?, 'admin')",
            [
              "admin123",
              "admin@unicafe.com",
              adminFromAdminsTable.admin_password,
            ]
          );
          console.log("✅ Admin account migrated to users table");
        } else {
          // Update existing user to admin role
          console.log("📋 Updating existing user to admin role...");
          await db.runAsync(
            "UPDATE users SET user_role = 'admin', user_username = ? WHERE user_email = ?",
            ["admin123", "admin@unicafe.com"]
          );
          console.log("✅ User updated to admin role");
        }
      }
    } else {
      console.log(
        "✅ admins table does not exist, checking for admin in users table..."
      );
      const existingAdmin = await db.getAsync(
        "SELECT * FROM users WHERE user_email = ?",
        ["admin@unicafe.com"]
      );

      if (!existingAdmin) {
        console.log("📋 Creating admin account in users table...");
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await db.runAsync(
          "INSERT INTO users (user_username, user_email, user_password, user_role) VALUES (?, ?, ?, 'admin')",
          ["admin123", "admin@unicafe.com", hashedPassword]
        );
        console.log("✅ Admin account created");
      } else {
        console.log("📋 Updating existing user to admin role...");
        await db.runAsync(
          "UPDATE users SET user_role = 'admin', user_username = ? WHERE user_email = ?",
          ["admin123", "admin@unicafe.com"]
        );
        console.log("✅ User updated to admin role");
      }
    }

    console.log("\n✨ Migration complete!");
    console.log("\n📝 Admin Account:");
    console.log("   Username: admin123");
    console.log("   Email: admin@unicafe.com");
    console.log("   Password: admin123");
    console.log("   Role: admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

// Wait for database connection
setTimeout(migrateToRoleBasedAuth, 1000);
