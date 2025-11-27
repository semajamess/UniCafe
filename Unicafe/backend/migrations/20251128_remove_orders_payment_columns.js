import db from '../database.js';

/**
 * Migration: remove customer_* and payment_* columns from `orders` and
 * replace `customer_id` with `user_id`, add `payment_id`.
 *
 * Usage: run from backend folder with `node migrations/20251128_remove_orders_payment_columns.js`
 * Make sure to backup `unicafe.db` before running.
 */

const migrate = async () => {
  try {
    console.log('Starting migration: rebuild orders table');

    // Turn off foreign keys for the migration window
    await db.runAsync('PRAGMA foreign_keys = OFF');

    // Create new orders table with cleaned schema
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS orders_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (payment_id) REFERENCES payments(id)
      )
    `);

    // Copy data: map customer_id -> user_id, preserve id, total, status, created_at
    await db.runAsync(`
      INSERT OR REPLACE INTO orders_new (id, user_id, total, status, created_at)
      SELECT id, customer_id, total, status, created_at FROM orders
    `);

    // Attempt to populate payment_id from existing payments table (one payment per order assumed)
    await db.runAsync(`
      UPDATE orders_new
      SET payment_id = (
        SELECT id FROM payments p WHERE p.order_id = orders_new.id LIMIT 1
      )
    `);

    // Drop old orders table and rename new
    await db.runAsync('DROP TABLE IF EXISTS orders');
    await db.runAsync('ALTER TABLE orders_new RENAME TO orders');

    // Re-enable foreign keys
    await db.runAsync('PRAGMA foreign_keys = ON');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

migrate();
