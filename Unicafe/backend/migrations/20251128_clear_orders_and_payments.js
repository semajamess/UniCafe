import sqlite3 from 'sqlite3';
import path from 'path';

// Safe migration: deletes all orders, order_items, and payments rows.
// This is irreversible. Use only in development or if you have backups.

const dbPath = path.resolve('./unicafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB connect error:', err);
    process.exit(1);
  }
});

// Set a busy timeout so SQLite will wait briefly for locks to clear instead of failing immediately
db.run('PRAGMA busy_timeout = 5000');

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) return reject(err);
    resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows);
  });
});

(async () => {
  try {
    console.log('⚠️  This will DELETE all rows from order_items, payments, and orders in', dbPath);
    console.log('If you are sure, run this script.');

    // Double-check tables exist
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('orders','order_items','payments')");
    const tableNames = tables.map(t => t.name);
    if (!tableNames.includes('orders') || !tableNames.includes('order_items') || !tableNames.includes('payments')) {
      console.error('One or more required tables not found. Aborting.');
      process.exit(1);
    }

    // Perform deletions
    await run('DELETE FROM order_items');
    await run('DELETE FROM payments');
    await run('DELETE FROM orders');

    // Optional: vacuum to reclaim space
    await run('VACUUM');

    console.log('✅ Cleared orders, order_items, and payments.');
    db.close(() => process.exit(0));
  } catch (err) {
    console.error('Migration failed:', err);
    // Ensure DB is closed before exiting
    try { db.close(() => process.exit(1)); } catch (e) { process.exit(1); }
  }
})();
