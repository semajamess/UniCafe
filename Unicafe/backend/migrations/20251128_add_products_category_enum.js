import db from '../database.js';

// Migration: convert products.category_id -> products.category (enum-like), preserve data

const run = async () => {
  try {
    console.log('Starting migration: add products.category and migrate existing data');

    // Check if products table already has a 'category' column
    const cols = await db.allAsync("PRAGMA table_info('products')");
    if (cols.some(c => c.name === 'category')) {
      console.log('Migration skipped: products.category already exists');
      process.exit(0);
    }

    // Create new products table with desired schema
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS products_new (
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

    // Copy data from old products, mapping category_id -> categories.name
    await db.runAsync(`
      INSERT INTO products_new (id, category, name, description, price, stock, image_url, is_available, created_at)
      SELECT p.id,
             COALESCE((SELECT name FROM categories c WHERE c.id = p.category_id), 'Food') as category,
             p.name, p.description, p.price, p.stock, p.image_url, p.is_available, p.created_at
      FROM products p
    `);

    // Drop old products table and replace
    await db.runAsync('DROP TABLE IF EXISTS products');
    await db.runAsync('ALTER TABLE products_new RENAME TO products');

    // Rename categories table to categories_backup for safety (do not drop)
    const categoryCols = await db.allAsync("PRAGMA table_info('categories')");
    if (categoryCols && categoryCols.length > 0) {
      await db.runAsync('ALTER TABLE categories RENAME TO categories_backup');
      console.log('Renamed existing categories table to categories_backup');
    } else {
      console.log('No categories table found to rename');
    }

    console.log('Migration complete: products now use `category` (enum-like)');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

run();
