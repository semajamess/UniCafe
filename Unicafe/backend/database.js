import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { runMigration } from './migrations/20251201_refactor_database_with_prefixes.js';

const dbPath = path.resolve('./unicafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
    console.log('    DB file:', dbPath);
  }
});

// Promisify database methods for async/await
// sqlite3's `run` callback doesn't pass the result object to the callback
// (it provides `this.lastID` and `this.changes` on the callback `this`).
// Promisify would resolve to `undefined`, so provide a small wrapper
// that resolves `{ lastID, changes }` which the application expects.
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
  });
};
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Initialize database tables with prefixed column names
export const initDatabase = async () => {
  try {
    // Run migration first to refactor existing database
    // Pass the database handle to the migration so it uses the same connection
    await runMigration(db);

    // All tables are now created by the migration script
    // No need to create them again here

    console.log('✅ Database tables initialized');

    // Note: Categories seeding removed - categories are now product_category attribute in products table

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export default db;
