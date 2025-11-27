import db from './database.js';

(async () => {
  try {
    const users = await db.allAsync('SELECT id, username, email, google_id, created_at FROM users');
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      console.log(u);
    }
  } catch (err) {
    console.error('Error reading users:', err);
  } finally {
    process.exit(0);
  }
})();
