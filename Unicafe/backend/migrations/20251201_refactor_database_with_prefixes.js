/**
 * MAJOR MIGRATION: Refactor entire database schema with proper column prefixes
 * 
 * This migration renames all columns to include their table prefix for clarity.
 * Example: id → user_id, email → user_email
 * 
 * NOTE: Categories table is deprecated - using product_category attribute instead
 * 
 * Tables affected:
 * - users → user_id, user_username, user_email, user_password, user_google_id, user_profile_image, user_created_at
 * - products → product_id, product_category, product_name, product_description, product_price, product_stock, product_image_url, product_is_available, product_created_at
 * - orders → order_id, order_user_id, order_customer_name, order_customer_email, order_total, order_status, order_created_at
 * - order_items → order_item_id, order_item_order_id, order_item_product_id, order_item_product_name, order_item_quantity, order_item_price
 * - payments → payment_id, payment_order_id, payment_amount, payment_method, payment_provider_txn_id, payment_status, payment_metadata, payment_created_at
 * - admins → admin_id, admin_email, admin_password, admin_name, admin_created_at
 * - otp_requests → otp_id, otp_email, otp_code, otp_attempts, otp_expires_at, otp_created_at
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Export function that accepts a database handle
export const runMigration = async (dbInstance) => {
  // Use the passed database handle instead of creating a new one
  const db = dbInstance;
  try {
    console.log('🔄 Starting database schema refactor with column prefixes...');

    // Check if migration has already been run
    const tables = await db.allAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
    );
    
    if (tables.length > 0) {
      const columns = await db.allAsync("PRAGMA table_info(users)");
      const hasUserIdPrefix = columns.some(col => col.name === 'user_id');
      
      if (hasUserIdPrefix) {
        console.log('✅ Database schema already has prefixes. Checking for otp_payload column...');
        
        // Check if otp_requests table needs otp_payload column added
        const otpTables = await db.allAsync(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='otp_requests'"
        );
        
        if (otpTables.length > 0) {
          const otpColumns = await db.allAsync("PRAGMA table_info(otp_requests)");
          const hasPayloadColumn = otpColumns.some(col => col.name === 'otp_payload');
          
          if (!hasPayloadColumn) {
            console.log('📋 Adding otp_payload column to otp_requests table...');
            try {
              await db.runAsync('ALTER TABLE otp_requests ADD COLUMN otp_payload TEXT');
              console.log('✅ Added otp_payload column to otp_requests');
            } catch (e) {
              console.warn('⚠️ Could not add otp_payload column (may already exist):', e.message);
            }
          } else {
            console.log('✅ otp_payload column already exists in otp_requests');
          }
        }
        
        return;
      }
    }

    // Step 1: Create new tables with prefixed columns
    console.log('📋 Creating new tables with prefixed schema...');

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users_new (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_username TEXT,
        user_email TEXT UNIQUE NOT NULL,
        user_password TEXT,
        user_google_id TEXT UNIQUE,
        user_profile_image TEXT,
        user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Note: categories table is deprecated - using product_category as an attribute in products instead

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS products_new (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_category TEXT NOT NULL CHECK (product_category IN ('Drinks', 'Food')) DEFAULT 'Food',
        product_name TEXT NOT NULL,
        product_description TEXT,
        product_price REAL NOT NULL,
        product_stock INTEGER DEFAULT 0,
        product_image_url TEXT,
        product_is_available BOOLEAN DEFAULT 1,
        product_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS orders_new (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_user_id INTEGER,
        order_customer_name TEXT,
        order_customer_email TEXT,
        order_total REAL NOT NULL,
        order_status TEXT DEFAULT 'pending',
        order_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_user_id) REFERENCES users_new(user_id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS order_items_new (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_item_order_id INTEGER NOT NULL,
        order_item_product_id INTEGER NOT NULL,
        order_item_product_name TEXT NOT NULL,
        order_item_quantity INTEGER NOT NULL,
        order_item_price REAL NOT NULL,
        FOREIGN KEY (order_item_order_id) REFERENCES orders_new(order_id),
        FOREIGN KEY (order_item_product_id) REFERENCES products_new(product_id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS payments_new (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_order_id INTEGER,
        payment_amount REAL NOT NULL,
        payment_method TEXT,
        payment_provider_txn_id TEXT,
        payment_status TEXT DEFAULT 'completed',
        payment_metadata TEXT,
        payment_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_order_id) REFERENCES orders_new(order_id)
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS admins_new (
        admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_email TEXT UNIQUE NOT NULL,
        admin_password TEXT NOT NULL,
        admin_name TEXT,
        admin_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS otp_requests_new (
        otp_id INTEGER PRIMARY KEY AUTOINCREMENT,
        otp_email TEXT,
        otp_code TEXT NOT NULL,
        otp_payload TEXT,
        otp_attempts INTEGER DEFAULT 0,
        otp_expires_at DATETIME NOT NULL,
        otp_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 2: Migrate data from old tables to new tables
    console.log('🔄 Migrating data from old schema to new schema...');

    // Check if old tables exist and have data
    const checkTable = (tableName) => {
      return new Promise((resolve) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          [tableName],
          (err, row) => resolve(!!row)
        );
      });
    };

    if (await checkTable('users')) {
      await db.runAsync(`
        INSERT OR IGNORE INTO users_new (user_id, user_username, user_email, user_password, user_google_id, user_profile_image, user_created_at)
        SELECT id, username, email, password, google_id, profile_image, created_at FROM users
      `);
      console.log('✅ Users data migrated');
    }

    // Skip categories - table is deprecated, using product_category attribute instead

    if (await checkTable('products')) {
      await db.runAsync(`
        INSERT OR IGNORE INTO products_new (product_id, product_category, product_name, product_description, product_price, product_stock, product_image_url, product_is_available, product_created_at)
        SELECT id, category, name, description, price, stock, image_url, is_available, created_at FROM products
      `);
      console.log('✅ Products data migrated');
    }

    if (await checkTable('orders')) {
      // Check if old orders table has customer_name column
      const orderCols = await db.allAsync("PRAGMA table_info(orders)");
      const hasCustomerName = orderCols.some(c => c.name === 'customer_name');
      const hasCustomerEmail = orderCols.some(c => c.name === 'customer_email');
      
      let selectSQL = 'SELECT id, user_id, total, status, created_at';
      if (hasCustomerName) selectSQL += ', customer_name';
      else selectSQL += ', NULL as customer_name';
      if (hasCustomerEmail) selectSQL += ', customer_email';
      else selectSQL += ', NULL as customer_email';
      selectSQL += ' FROM orders';
      
      await db.runAsync(`
        INSERT OR IGNORE INTO orders_new (order_id, order_user_id, order_total, order_status, order_created_at, order_customer_name, order_customer_email)
        ${selectSQL}
      `);
      console.log('✅ Orders data migrated');
    }

    if (await checkTable('order_items')) {
      await db.runAsync(`
        INSERT OR IGNORE INTO order_items_new (order_item_id, order_item_order_id, order_item_product_id, order_item_product_name, order_item_quantity, order_item_price)
        SELECT id, order_id, product_id, product_name, quantity, price FROM order_items
      `);
      console.log('✅ Order items data migrated');
    }

    if (await checkTable('payments')) {
      await db.runAsync(`
        INSERT OR IGNORE INTO payments_new (payment_id, payment_order_id, payment_amount, payment_method, payment_provider_txn_id, payment_status, payment_metadata, payment_created_at)
        SELECT id, order_id, amount, method, provider_txn_id, status, metadata, created_at FROM payments
      `);
      console.log('✅ Payments data migrated');
    }

    if (await checkTable('admins')) {
      await db.runAsync(`
        INSERT OR IGNORE INTO admins_new (admin_id, admin_email, admin_password, admin_name, admin_created_at)
        SELECT id, email, password, name, created_at FROM admins
      `);
      console.log('✅ Admins data migrated');
    }

    if (await checkTable('otp_requests')) {
      try {
        // Check which columns exist in old otp_requests table
        const otpCols = await db.allAsync("PRAGMA table_info(otp_requests)");
        const hasEmail = otpCols.some(c => c.name === 'email');
        const hasCode = otpCols.some(c => c.name === 'code');
        const hasAttempts = otpCols.some(c => c.name === 'attempts');
        const hasExpiresAt = otpCols.some(c => c.name === 'expires_at');
        const hasCreatedAt = otpCols.some(c => c.name === 'created_at');
        
        let otpSelectSQL = 'SELECT id';
        if (hasEmail) otpSelectSQL += ', email';
        else otpSelectSQL += ', NULL as email';
        if (hasCode) otpSelectSQL += ', code';
        else otpSelectSQL += ', NULL as code';
        if (hasAttempts) otpSelectSQL += ', attempts';
        else otpSelectSQL += ', NULL as attempts';
        if (hasExpiresAt) otpSelectSQL += ', expires_at';
        else otpSelectSQL += ', NULL as expires_at';
        if (hasCreatedAt) otpSelectSQL += ', created_at';
        else otpSelectSQL += ', NULL as created_at';
        otpSelectSQL += ' FROM otp_requests';
        
        await db.runAsync(`
          INSERT OR IGNORE INTO otp_requests_new (otp_id, otp_email, otp_code, otp_attempts, otp_expires_at, otp_created_at)
          ${otpSelectSQL}
        `);
        console.log('✅ OTP requests data migrated');
      } catch (err) {
        console.log('⚠️  OTP requests migration skipped (table structure incompatible):', err.message);
      }
    }

    // Step 3: Rename old tables to backup and new tables to original names
    console.log('🔄 Finalizing schema update...');

    // Only rename old tables if they exist
    if (await checkTable('users')) {
      try {
        await db.runAsync('ALTER TABLE users RENAME TO users_old');
      } catch (e) {
        console.log('⚠️  Could not rename old users table (may not exist)');
      }
    }
    // Skip categories - table is deprecated

    if (await checkTable('products')) {
      try {
        await db.runAsync('ALTER TABLE products RENAME TO products_old');
      } catch (e) {
        console.log('⚠️  Could not rename old products table');
      }
    }
    if (await checkTable('orders')) {
      try {
        await db.runAsync('ALTER TABLE orders RENAME TO orders_old');
      } catch (e) {
        console.log('⚠️  Could not rename old orders table');
      }
    }
    if (await checkTable('order_items')) {
      try {
        await db.runAsync('ALTER TABLE order_items RENAME TO order_items_old');
      } catch (e) {
        console.log('⚠️  Could not rename old order_items table');
      }
    }
    if (await checkTable('payments')) {
      try {
        await db.runAsync('ALTER TABLE payments RENAME TO payments_old');
      } catch (e) {
        console.log('⚠️  Could not rename old payments table');
      }
    }
    if (await checkTable('admins')) {
      try {
        await db.runAsync('ALTER TABLE admins RENAME TO admins_old');
      } catch (e) {
        console.log('⚠️  Could not rename old admins table');
      }
    }
    if (await checkTable('otp_requests')) {
      try {
        await db.runAsync('ALTER TABLE otp_requests RENAME TO otp_requests_old');
      } catch (e) {
        console.log('⚠️  Could not rename old otp_requests table');
      }
    }

    // Rename new tables to original names (only if they exist)
    if (await checkTable('users_new')) {
      try {
        await db.runAsync('ALTER TABLE users_new RENAME TO users');
        console.log('✅ Renamed users_new to users');
      } catch (e) {
        console.error('❌ Failed to rename users_new:', e.message);
        throw e;
      }
    }
    // Skip categories_new - table is deprecated

    if (await checkTable('products_new')) {
      try {
        await db.runAsync('ALTER TABLE products_new RENAME TO products');
        console.log('✅ Renamed products_new to products');
      } catch (e) {
        console.error('❌ Failed to rename products_new:', e.message);
        throw e;
      }
    }
    if (await checkTable('orders_new')) {
      try {
        await db.runAsync('ALTER TABLE orders_new RENAME TO orders');
        console.log('✅ Renamed orders_new to orders');
      } catch (e) {
        console.error('❌ Failed to rename orders_new:', e.message);
        throw e;
      }
    }
    if (await checkTable('order_items_new')) {
      try {
        await db.runAsync('ALTER TABLE order_items_new RENAME TO order_items');
        console.log('✅ Renamed order_items_new to order_items');
      } catch (e) {
        console.error('❌ Failed to rename order_items_new:', e.message);
        throw e;
      }
    }
    if (await checkTable('payments_new')) {
      try {
        await db.runAsync('ALTER TABLE payments_new RENAME TO payments');
        console.log('✅ Renamed payments_new to payments');
      } catch (e) {
        console.error('❌ Failed to rename payments_new:', e.message);
        throw e;
      }
    }
    if (await checkTable('admins_new')) {
      try {
        await db.runAsync('ALTER TABLE admins_new RENAME TO admins');
        console.log('✅ Renamed admins_new to admins');
      } catch (e) {
        console.error('❌ Failed to rename admins_new:', e.message);
        throw e;
      }
    }
    if (await checkTable('otp_requests_new')) {
      try {
        await db.runAsync('ALTER TABLE otp_requests_new RENAME TO otp_requests');
        console.log('✅ Renamed otp_requests_new to otp_requests');
      } catch (e) {
        console.error('❌ Failed to rename otp_requests_new:', e.message);
        throw e;
      }
    }

    console.log('✅ Schema refactoring completed successfully!');
    console.log('📊 Old tables preserved as: *_old');
    console.log('🎉 Database is ready with proper column prefixes!');

    // Do not close the database here - let database.js manage the connection
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Do not close the database here on error either
    throw error;
  }
};

// Kept for backwards compatibility if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const sqlite3 = await import('sqlite3');
  const path = await import('path');
  const dbPath = path.default.resolve('./unicafe.db');
  const testDb = new sqlite3.default.Database(dbPath);
  
  testDb.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      testDb.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  };
  testDb.allAsync = promisify(testDb.all.bind(testDb));
  testDb.getAsync = promisify(testDb.get.bind(testDb));
  
  await runMigration(testDb);
}
