/**
 * Seed Orders Script
 * 
 * This script clears existing orders, payments, and order_items data
 * then seeds fake data for testing the dashboard statistics.
 * 
 * Run with: node scripts/seedOrders.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
const dbPath = path.join(__dirname, '..', 'unicafe.db');
const db = new Database(dbPath);

console.log('🗄️  Connected to database:', dbPath);

// Sample data
const paymentMethods = ['bank_transfer', 'e_wallet'];
const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];

// Get existing products and users
const products = db.prepare('SELECT product_id, product_name, product_price FROM products').all();
const users = db.prepare('SELECT user_id, user_username, user_email FROM users').all();

if (products.length === 0) {
  console.error('❌ No products found in database. Please seed products first.');
  process.exit(1);
}

if (users.length === 0) {
  console.log('⚠️  No users found. Creating a test user...');
  db.prepare(`
    INSERT INTO users (user_username, user_email, user_password, user_phone) 
    VALUES ('TestUser', 'test@unicafe.com', 'hashedpassword', '09123456789')
  `).run();
}

const updatedUsers = db.prepare('SELECT user_id, user_username, user_email FROM users').all();

// Helper function to get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number between min and max
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random date within range
const randomDate = (startDays, endDays) => {
  const now = new Date();
  const start = new Date(now.getTime() - startDays * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - endDays * 24 * 60 * 60 * 1000);
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString();
};

// Clear existing data
console.log('\n🧹 Clearing existing orders, payments, and order items...');
db.prepare('DELETE FROM order_items').run();
db.prepare('DELETE FROM payments').run();
db.prepare('DELETE FROM orders').run();
db.prepare('DELETE FROM otp_requests').run();
console.log('✅ Cleared all order-related data');

// Seed orders
console.log('\n🌱 Seeding 75 orders with varied dates...');

const insertOrder = db.prepare(`
  INSERT INTO orders (user_id, order_customer_name, order_customer_email, order_total, order_status, order_created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, order_item_product_name, order_item_quantity, order_item_price)
  VALUES (?, ?, ?, ?, ?)
`);

const insertPayment = db.prepare(`
  INSERT INTO payments (order_id, payment_amount, payment_method, payment_status, payment_created_at)
  VALUES (?, ?, ?, ?, ?)
`);

// Distribution: 
// - 25 orders from this week (0-7 days ago)
// - 25 orders from this month but not this week (8-30 days ago)
// - 25 orders from older (31-90 days ago)

const orderDistribution = [
  { count: 25, startDays: 7, endDays: 0, label: 'This Week' },
  { count: 25, startDays: 30, endDays: 8, label: 'This Month (not this week)' },
  { count: 25, startDays: 90, endDays: 31, label: 'Older (1-3 months)' }
];

let totalOrders = 0;
let totalRevenue = 0;

const transaction = db.transaction(() => {
  for (const dist of orderDistribution) {
    console.log(`\n📦 Creating ${dist.count} orders for: ${dist.label}`);
    
    for (let i = 0; i < dist.count; i++) {
      const user = randomItem(updatedUsers);
      const orderDate = randomDate(dist.startDays, dist.endDays);
      
      // Determine order status with weighted probability
      // More completed orders, fewer cancelled
      const statusRoll = Math.random();
      let status;
      if (statusRoll < 0.6) status = 'completed';
      else if (statusRoll < 0.8) status = 'processing';
      else if (statusRoll < 0.95) status = 'pending';
      else status = 'cancelled';
      
      // Generate 1-5 items per order
      const itemCount = randomBetween(1, 5);
      let orderTotal = 0;
      const orderItems = [];
      
      for (let j = 0; j < itemCount; j++) {
        const product = randomItem(products);
        const quantity = randomBetween(1, 3);
        const price = parseFloat(product.product_price);
        orderTotal += price * quantity;
        
        orderItems.push({
          productId: product.product_id,
          productName: product.product_name,
          quantity,
          price
        });
      }
      
      // Insert order
      const orderResult = insertOrder.run(
        user.user_id,
        user.user_username,
        user.user_email,
        orderTotal.toFixed(2),
        status,
        orderDate
      );
      
      const orderId = orderResult.lastInsertRowid;
      
      // Insert order items
      for (const item of orderItems) {
        insertOrderItem.run(
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.price
        );
      }
      
      // Insert payment (only for non-pending orders)
      const paymentMethod = randomItem(paymentMethods);
      const paymentStatus = status === 'cancelled' ? 'failed' : (status === 'pending' ? 'pending' : 'completed');
      
      insertPayment.run(
        orderId,
        orderTotal.toFixed(2),
        paymentMethod,
        paymentStatus,
        orderDate
      );
      
      totalOrders++;
      if (status === 'completed') {
        totalRevenue += orderTotal;
      }
    }
  }
});

transaction();

console.log('\n' + '='.repeat(50));
console.log('✅ SEEDING COMPLETE!');
console.log('='.repeat(50));
console.log(`📊 Total Orders Created: ${totalOrders}`);
console.log(`💰 Total Revenue (completed): ₱${totalRevenue.toFixed(2)}`);
console.log(`📦 Products Used: ${products.length}`);
console.log(`👥 Users Used: ${updatedUsers.length}`);
console.log('='.repeat(50));

// Show breakdown
const stats = db.prepare(`
  SELECT 
    order_status,
    COUNT(*) as count,
    SUM(order_total) as total
  FROM orders 
  GROUP BY order_status
`).all();

console.log('\n📈 Order Status Breakdown:');
for (const stat of stats) {
  console.log(`   ${stat.order_status}: ${stat.count} orders (₱${parseFloat(stat.total || 0).toFixed(2)})`);
}

// Show date distribution
const thisWeek = db.prepare(`
  SELECT COUNT(*) as count, SUM(order_total) as total 
  FROM orders 
  WHERE order_created_at >= datetime('now', '-7 days')
`).get();

const thisMonth = db.prepare(`
  SELECT COUNT(*) as count, SUM(order_total) as total 
  FROM orders 
  WHERE order_created_at >= datetime('now', '-30 days')
`).get();

const allTime = db.prepare(`
  SELECT COUNT(*) as count, SUM(order_total) as total 
  FROM orders
`).get();

console.log('\n📅 Date Distribution:');
console.log(`   This Week: ${thisWeek.count} orders (₱${parseFloat(thisWeek.total || 0).toFixed(2)})`);
console.log(`   This Month: ${thisMonth.count} orders (₱${parseFloat(thisMonth.total || 0).toFixed(2)})`);
console.log(`   All Time: ${allTime.count} orders (₱${parseFloat(allTime.total || 0).toFixed(2)})`);

db.close();
console.log('\n🎉 Done! Your dashboard should now show statistics.');
