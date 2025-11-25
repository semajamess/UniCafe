import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./unicafe.db');

db.all('SELECT * FROM products LIMIT 10', (err, products) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('\nProducts with descriptions:\n');
    products.forEach(p => {
      console.log(`${p.name}`);
      console.log(`  ${p.description}`);
      console.log(`  ₱${p.price}\n`);
    });
  }
  db.close();
});
