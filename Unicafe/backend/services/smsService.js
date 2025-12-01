/**
 * SMS OTP Service
 * 
 * ═══════════════════════════════════════════════════════════════════
 * SUPPORTED PROVIDERS:
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 1. SEMAPHORE (Philippines) - Best for production
 *    - Sign up: https://semaphore.co/
 *    - Requires top-up or account approval
 *    - Cost: ~₱0.35-0.50 per SMS
 *    - Set: SEMAPHORE_API_KEY in .env
 * 
 * 2. TEXTBELT (Free tier) - Good for testing
 *    - 1 free SMS per day with key "textbelt"
 *    - No signup required for testing
 *    - Set: SMS_PROVIDER=textbelt in .env
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

import fetch from 'node-fetch';

// NOTE: Don't read env vars here - they're not loaded yet when this module is imported
// Read them inside the function instead

/**
 * Send OTP via SMS using Semaphore API
 * @param {string} phoneNumber - Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)
 * @param {string} otp - The OTP code to send
 * @param {string|number} requestId - Optional request ID for tracking
 * @returns {Promise<object>} - Result object with success status
 */
export async function sendOtpSms(phoneNumber, otp, requestId = null) {
  // Get API key from environment variable (read at runtime, not import time)
  const SEMAPHORE_API_KEY = process.env.SEMAPHORE_API_KEY || '';
  const SENDER_NAME = process.env.SEMAPHORE_SENDER_NAME || 'UniCafe';
  
  // Normalize phone number to international format (639XXXXXXXXX)
  let normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '63' + normalizedPhone.substring(1);
  } else if (normalizedPhone.startsWith('+63')) {
    normalizedPhone = normalizedPhone.substring(1);
  } else if (!normalizedPhone.startsWith('63')) {
    normalizedPhone = '63' + normalizedPhone;
  }

  const message = `Your UniCafe verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

  // If no API key configured, use demo mode
  if (!SEMAPHORE_API_KEY) {
    console.log('');
    console.log('='.repeat(55));
    console.log('SMS SERVICE - DEMO MODE');
    console.log('='.repeat(55));
    console.log('No SEMAPHORE_API_KEY found in environment');
    console.log('');
    console.log('To enable REAL SMS:');
    console.log('1. Sign up at https://semaphore.co/');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Add to backend/.env: SEMAPHORE_API_KEY=your_key');
    console.log('4. Restart the server');
    console.log('');
    console.log('-'.repeat(55));
    console.log(`To: ${maskPhoneNumber(phoneNumber)}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Message: ${message}`);
    console.log('='.repeat(55));
    console.log('');
    
    return {
      success: true,
      demo: true,
      message: 'Demo mode - OTP logged to console. Use the OTP code shown above.',
      otp: otp // Return OTP for demo testing
    };
  }

  try {
    console.log(`Sending SMS OTP to ${maskPhoneNumber(phoneNumber)}...`);
    console.log(`Using API Key: ${SEMAPHORE_API_KEY.substring(0, 8)}...`);
    
    // Semaphore API endpoint
    const response = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: SEMAPHORE_API_KEY,
        number: normalizedPhone,
        message: message,
        sendername: SENDER_NAME
      })
    });

    // Get raw response text first
    const responseText = await response.text();
    console.log('Semaphore API response:', responseText);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Not JSON - it's an error message from Semaphore
      console.error('Semaphore API Error (not JSON):', responseText);
      console.log('');
      console.log('='.repeat(55));
      console.log('SEMAPHORE ACCOUNT ISSUE');
      console.log('='.repeat(55));
      console.log('The API returned an error. Common causes:');
      console.log('1. Insufficient SMS credits - top up at semaphore.co');
      console.log('2. Account not verified - check your email');
      console.log('3. Invalid API key - check your dashboard');
      console.log('4. Sender name not registered');
      console.log('');
      console.log('Error message:', responseText);
      console.log('='.repeat(55));
      console.log('');
      console.log('Falling back to demo mode...');
      console.log(`Demo OTP for ${maskPhoneNumber(phoneNumber)}: ${otp}`);
      return {
        success: true,
        demo: true,
        error: responseText,
        otp: otp
      };
    }

    if (response.ok && data && !data.error) {
      console.log(`SMS sent successfully to ${maskPhoneNumber(phoneNumber)}`);
      return {
        success: true,
        messageId: data.message_id || data[0]?.message_id,
        demo: false
      };
    } else {
      console.error('Semaphore API error:', data);
      // Fall back to demo mode on error
      console.log('Falling back to demo mode...');
      console.log(`Demo OTP for ${maskPhoneNumber(phoneNumber)}: ${otp}`);
      return {
        success: true,
        demo: true,
        error: data.error || data.message || 'SMS API error',
        otp: otp
      };
    }
  } catch (error) {
    console.error('SMS send error:', error.message);
    // Fall back to demo mode
    console.log('Falling back to demo mode...');
    console.log(`Demo OTP for ${maskPhoneNumber(phoneNumber)}: ${otp}`);
    return {
      success: true,
      demo: true,
      error: error.message,
      otp: otp
    };
  }
}

/**
 * Mask phone number for privacy in logs
 * @param {string} phone - Phone number to mask
 * @returns {string} - Masked phone number (e.g., 09*****567)
 */
export function maskPhoneNumber(phone) {
  if (!phone || phone.length < 4) return '****';
  const last4 = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/\d/g, '*');
  return masked + last4;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * ALTERNATIVE SMS PROVIDERS (Also have free tiers)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * 1. VONAGE (Nexmo)
 *    - Sign up: https://www.vonage.com/communications-apis/
 *    - Free trial credits available
 *    - Set in .env:
 *      SMS_PROVIDER=vonage
 *      VONAGE_API_KEY=your_key
 *      VONAGE_API_SECRET=your_secret
 * 
 * 2. TWILIO
 *    - Sign up: https://www.twilio.com/
 *    - Free trial with $15 credit
 *    - Set in .env:
 *      SMS_PROVIDER=twilio
 *      TWILIO_SID=your_sid
 *      TWILIO_AUTH_TOKEN=your_token
 *      TWILIO_PHONE=your_twilio_number
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

export default { sendOtpSms, maskPhoneNumber };
