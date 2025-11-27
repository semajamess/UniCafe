import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./unicafe.db');

db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total products:', rows[0].count);
  }
  
  db.all('SELECT * FROM products LIMIT 5', (err, products) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('\nFirst 5 products:');
      products.forEach(p => {
        console.log(`- ${p.name} (₱${p.price}) - ${p.category || p.category_id || ''}`);
      });
    }
    db.close();
  });
});
