import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./unicafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB connect error:', err.message || err);
    process.exit(2);
  }
});

// Wait helper
const wait = ms => new Promise(r => setTimeout(r, ms));

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
    console.log('Target DB:', dbPath);
    console.log('Setting busy_timeout to 10000ms');
    await run('PRAGMA busy_timeout = 10000');

    // Verify required tables exist
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('orders','payments')");
    const names = tables.map(t => t.name);
    if (!names.includes('orders') || !names.includes('payments')) {
      console.error('Required tables not found:', names);
      db.close(() => process.exit(1));
      return;
    }

    const maxAttempts = 6;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Deleting payments then orders...`);
        // Delete payments first (you indicated order_items already cleared)
        const res1 = await run('DELETE FROM payments');
        console.log('payments deleted, changes:', res1.changes);

        const res2 = await run('DELETE FROM orders');
        console.log('orders deleted, changes:', res2.changes);

        console.log('Running VACUUM to reclaim space...');
        await run('VACUUM');

        console.log('✅ Cleared payments and orders.');
        db.close(() => process.exit(0));
        return;
      } catch (err) {
        if (err && err.code === 'SQLITE_BUSY') {
          console.warn('Database busy, will retry after 1s...');
          await wait(1000);
          continue;
        }
        throw err;
      }
    }

    console.error('Failed: database remained busy after retries.');
    db.close(() => process.exit(1));
  } catch (err) {
    console.error('Error during clear:', err);
    try { db.close(() => process.exit(1)); } catch (e) { process.exit(1); }
  }
})();
