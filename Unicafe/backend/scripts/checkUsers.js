import db from '../database.js';

const checkUsers = async () => {
  try {
    const users = await db.allAsync(`
      SELECT user_id, user_username, user_email, user_profile_image, user_google_id 
      FROM users 
      WHERE user_google_id IS NOT NULL
    `);

    console.log('\n=== Google Users in Database ===\n');
    users.forEach(user => {
      console.log(`ID: ${user.user_id}`);
      console.log(`Username: ${user.user_username}`);
      console.log(`Email: ${user.user_email}`);
      console.log(`Google ID: ${user.user_google_id}`);
      console.log(`Profile Image: ${user.user_profile_image ? user.user_profile_image.substring(0, 80) + '...' : 'NULL'}`);
      console.log(`Is Google URL: ${user.user_profile_image?.includes('googleusercontent.com') ? 'YES ✅' : 'NO ❌ (DiceBear or other)'}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
