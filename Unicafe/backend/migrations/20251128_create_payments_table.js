import db from '../database.js';

// Migration: create payments table and add payment_id to orders if missing

const run = async () => {
  try {
    console.log('Starting migration: create payments table and add payment_id to orders');

    // Create payments table if not exists
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        amount REAL NOT NULL,
        method TEXT,
        provider_txn_id TEXT,
        status TEXT DEFAULT 'completed',
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    // Check if orders table has payment_id column
    const cols = await db.allAsync("PRAGMA table_info('orders')");
    if (!cols.some(c => c.name === 'payment_id')) {
      console.log('Adding payment_id column to orders');
      await db.runAsync('ALTER TABLE orders ADD COLUMN payment_id INTEGER');
    } else {
      console.log('orders.payment_id already exists, skipping ALTER');
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

run();
