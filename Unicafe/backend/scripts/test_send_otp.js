import dotenv from 'dotenv';
dotenv.config();

import { sendOtpEmail } from '../services/emailService.js';
import db from '../database.js';

(async () => {
  try {
    const row = await db.getAsync("SELECT email, username FROM users WHERE email IS NOT NULL LIMIT 1");
    if (!row || !row.email) {
      console.log('No user with email found in users table. Provide an email or create a user.');
      process.exit(1);
    }
    const recipient = row.email;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Sending OTP to', recipient);
    const info = await sendOtpEmail(recipient, otp, 'TEST-OTP');
    console.log('sendOtpEmail returned:', info && info.messageId ? info.messageId : info);
    if (typeof (import('nodemailer').then) === 'function') {
      // no-op: keep dynamic import out
    }
    // sendOtpEmail already logs Ethereal preview URL; exit
    process.exit(0);
  } catch (err) {
    console.error('Test send failed:', err);
    process.exit(2);
  }
})();
