import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.resolve('./unicafe.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('DB connect error:', err)
    process.exit(1)
  }
})

const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err)
    resolve({ lastID: this.lastID, changes: this.changes })
  })
})

const allAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err)
    resolve(rows)
  })
})

const main = async () => {
  try {
    console.log('Running migration: add payments.provider_txn_id column')
    const info = await allAsync("PRAGMA table_info(payments)")
    const cols = info.map(c => c.name)
    if (cols.includes('provider_txn_id')) {
      console.log('Column `provider_txn_id` already exists on payments — nothing to do')
      process.exit(0)
    }

    // ALTER TABLE ADD COLUMN is safe in SQLite
    await runAsync('ALTER TABLE payments ADD COLUMN provider_txn_id TEXT')
    console.log('✅ Added `provider_txn_id` column to payments')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

main()
