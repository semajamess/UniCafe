import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./unicafe.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB connect error:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS otp_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    otp TEXT NOT NULL,
    payload TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )` , (err) => {
    if (err) console.error('Migration error:', err);
    else console.log('otp_requests table ensured');
  });
});

db.close(() => process.exit(0));
