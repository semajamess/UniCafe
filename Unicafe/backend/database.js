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
    // Categories table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table (store category as an enum-like TEXT with a CHECK constraint)
    // SQLite doesn't have a native ENUM type, so enforce allowed values with CHECK.
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL CHECK (category IN ('Drinks', 'Food')) DEFAULT 'Food',
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        image_url TEXT,
        is_available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table (for both registered users and guests)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        google_id TEXT UNIQUE,
        profile_image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table (easily accessible for customer order tracking)
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        customer_name TEXT,
        customer_email TEXT,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Order items table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Payments table (optional detailed records)
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

    // Admin users table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized');

    // Seed default categories if empty
    const categoryCount = await db.getAsync('SELECT COUNT(*) as count FROM categories');
    if (categoryCount.count === 0) {
      await seedCategories();
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Seed default categories
const seedCategories = async () => {
  const categories = [
    { name: 'Drinks', description: 'Smoothies, shakes, and refreshing beverages' },
    { name: 'Food', description: 'Breakfast and cafe food items' }
  ];

  for (const category of categories) {
    await db.runAsync(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [category.name, category.description]
    );
  }
  console.log('✅ Default categories seeded');
};

export default db;
