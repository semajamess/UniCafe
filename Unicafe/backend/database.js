import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

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

// Initialize database tables
export const initDatabase = async () => {
  try {
    console.log('✅ Database initialized and ready');
    // Database tables already exist from previous migrations
    // No additional setup needed

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export default db;
