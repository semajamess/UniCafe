import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../unicafe.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to database:', dbPath);
  }
});

// Promisify database methods
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const clearData = async () => {
  try {
    console.log('🗑️  Clearing database tables...');
    
    // Clear data in order of dependencies (order_items first, then payments, then orders)
    console.log('Clearing order_items...');
    await db.runAsync('DELETE FROM order_items');
    
    console.log('Clearing payments...');
    await db.runAsync('DELETE FROM payments');
    
    console.log('Clearing orders...');
    await db.runAsync('DELETE FROM orders');
    
    console.log('✅ All data cleared successfully!');
    console.log('   - order_items: deleted');
    console.log('   - payments: deleted');
    console.log('   - orders: deleted');
    
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    db.close();
    process.exit(1);
  }
};

clearData();
