/**
 * Migration: Fix Foreign Key Naming Conventions
 * Date: 2024-12-07
 * 
 * Changes:
 * - orders.order_user_id → orders.user_id
 * - order_items.order_item_order_id → order_items.order_id
 * - order_items.order_item_product_id → order_items.product_id
 * - payments.payment_order_id → payments.order_id
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const dbPath = './unicafe.db';

async function migrate() {
  const db = new sqlite3.Database(dbPath);
  
  const run = promisify(db.run.bind(db));
  const all = promisify(db.all.bind(db));
  
  try {
    console.log('🔄 Starting foreign key naming migration...');
    
    // Enable foreign keys
    await run('PRAGMA foreign_keys = OFF');
    
    await run('BEGIN TRANSACTION');
    
    // 1. Migrate ORDERS table
    console.log('📝 Migrating orders table...');
    await run(`
      CREATE TABLE orders_new (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        order_customer_name TEXT,
        order_customer_email TEXT,
        order_total REAL NOT NULL,
        order_status TEXT DEFAULT 'pending',
        order_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
    
    await run(`
      INSERT INTO orders_new (order_id, user_id, order_customer_name, order_customer_email, order_total, order_status, order_created_at)
      SELECT order_id, order_user_id, order_customer_name, order_customer_email, order_total, order_status, order_created_at
      FROM orders
    `);
    
    // 2. Migrate ORDER_ITEMS table
    console.log('📝 Migrating order_items table...');
    await run(`
      CREATE TABLE order_items_new (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        order_item_product_name TEXT NOT NULL,
        order_item_quantity INTEGER NOT NULL,
        order_item_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders_new(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
      )
    `);
    
    await run(`
      INSERT INTO order_items_new (order_item_id, order_id, product_id, order_item_product_name, order_item_quantity, order_item_price)
      SELECT order_item_id, order_item_order_id, order_item_product_id, order_item_product_name, order_item_quantity, order_item_price
      FROM order_items
    `);
    
    // 3. Migrate PAYMENTS table
    console.log('📝 Migrating payments table...');
    await run(`
      CREATE TABLE payments_new (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        payment_amount REAL NOT NULL,
        payment_method TEXT,
        payment_provider_txn_id TEXT,
        payment_status TEXT DEFAULT 'pending',
        payment_metadata TEXT,
        payment_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders_new(order_id)
      )
    `);
    
    await run(`
      INSERT INTO payments_new (payment_id, order_id, payment_amount, payment_method, payment_provider_txn_id, payment_status, payment_metadata, payment_created_at)
      SELECT payment_id, payment_order_id, payment_amount, payment_method, payment_provider_txn_id, payment_status, payment_metadata, payment_created_at
      FROM payments
    `);
    
    // Drop old tables
    console.log('🗑️  Dropping old tables...');
    await run('DROP TABLE payments');
    await run('DROP TABLE order_items');
    await run('DROP TABLE orders');
    
    // Rename new tables
    console.log('✏️  Renaming new tables...');
    await run('ALTER TABLE orders_new RENAME TO orders');
    await run('ALTER TABLE order_items_new RENAME TO order_items');
    await run('ALTER TABLE payments_new RENAME TO payments');
    
    await run('COMMIT');
    await run('PRAGMA foreign_keys = ON');
    
    console.log('✅ Migration completed successfully!');
    
    // Verify changes
    const ordersColumns = await all('PRAGMA table_info(orders)');
    const orderItemsColumns = await all('PRAGMA table_info(order_items)');
    const paymentsColumns = await all('PRAGMA table_info(payments)');
    
    console.log('\n📊 Verification:');
    console.log('Orders columns:', ordersColumns.map(c => c.name).join(', '));
    console.log('Order Items columns:', orderItemsColumns.map(c => c.name).join(', '));
    console.log('Payments columns:', paymentsColumns.map(c => c.name).join(', '));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await run('ROLLBACK');
    throw error;
  } finally {
    db.close();
  }
}

migrate().catch(console.error);
