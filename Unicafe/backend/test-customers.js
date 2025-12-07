import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./unicafe.db');

const sql = `
  SELECT 
    COALESCE(u.user_username, o.order_customer_name, 'Walk-in Customer') as name,
    COUNT(o.order_id) as orders,
    COALESCE(SUM(o.order_total), 0) as totalSpent,
    CASE WHEN u.user_id IS NULL THEN 'walk-in' ELSE 'registered' END as type
  FROM orders o
  LEFT JOIN users u ON o.user_id = u.user_id
  WHERE o.order_status != 'cancelled'
  GROUP BY COALESCE(u.user_id, o.order_customer_name, 'Walk-in')
  ORDER BY totalSpent DESC
  LIMIT 5
`;

db.all(sql, (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Top Customers:', JSON.stringify(rows, null, 2));
  }
  db.close();
});
