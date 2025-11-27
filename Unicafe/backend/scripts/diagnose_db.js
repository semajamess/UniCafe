import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve('./unicafe.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('DB connect error:', err.message || err);
    process.exit(2);
  }
});

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

(async () => {
  try {
    console.log('Inspecting DB at', dbPath);

    const fk = await all('PRAGMA foreign_keys');
    console.log('PRAGMA foreign_keys:', fk[0]);

    const tables = await all("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
    console.log('\nTables and views:');
    tables.forEach(t => console.log('-', t.name, t.type));

    const target = ['orders','order_items','payments'];
    for (const name of target) {
      const exists = tables.find(t => t.name === name);
      if (!exists) {
        console.log(`\nTable not found: ${name}`);
        continue;
      }
      const rowCount = await all(`SELECT COUNT(*) as cnt FROM ${name}`);
      console.log(`\n${name} row count:`, rowCount[0].cnt);

      const sample = await all(`SELECT * FROM ${name} LIMIT 5`);
      console.log(`${name} sample rows (up to 5):`, sample.length ? sample : '(none)');

      const sqlDef = await all(`SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`, [name]);
      console.log(`${name} SQL definition:`, sqlDef[0] ? sqlDef[0].sql : '(not found)');
    }

    // Integrity check (read-only)
    try {
      const integrity = await all('PRAGMA integrity_check');
      console.log('\nPRAGMA integrity_check:', integrity.map(r => Object.values(r)).flat().join('; '));
    } catch (e) {
      console.warn('Integrity check error (may be locked):', e.message || e);
    }

    db.close(() => process.exit(0));
  } catch (err) {
    console.error('Diagnostic failed:', err.message || err);
    try { db.close(() => process.exit(1)); } catch (e) { process.exit(1); }
  }
})();
