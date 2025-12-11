import db from '../database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'unicafe-secret-key-2025';

// Update user profile (username, password, profile_image, phone)
export const updateUserProfile = async (userId, updates) => {
  try {
    const { username, password, currentPassword, profile_image, phone } = updates;

    if (!username && !password && !profile_image && !phone) {
      return { success: false, error: 'No profile data provided' };
    }

    if (username) {
      if (username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters' };
      }
      const existingUser = await db.getAsync(
        'SELECT user_id FROM users WHERE user_username = ? AND user_id != ? AND user_deleted_at IS NULL',
        [username, userId]
      );
      if (existingUser) {
        return { success: false, error: 'Username already taken' };
      }
    }

    if (phone) {
      // Validate phone number format
      const phoneRegex = /^(\+63|0)?9\d{9}$/;
      const normalizedPhone = phone.replace(/[\s-]/g, '');
      if (!phoneRegex.test(normalizedPhone)) {
        return { success: false, error: 'Invalid phone number format. Use format: 09XXXXXXXXX' };
      }

      // Check if user already has a phone number
      const currentUser = await db.getAsync('SELECT user_phone FROM users WHERE user_id = ?', [userId]);
      if (currentUser && currentUser.user_phone) {
        return { success: false, error: 'You already have a phone number registered. Please contact support to change it.' };
      }

      // Check if phone number is already used by another user
      const existingPhone = await db.getAsync(
        'SELECT user_id FROM users WHERE user_phone = ? AND user_id != ? AND user_deleted_at IS NULL',
        [normalizedPhone, userId]
      );
      if (existingPhone) {
        return { success: false, error: 'This phone number is already registered to another account' };
      }
    }

    let hashedPassword = null;
    if (password) {
      // Verify current password before allowing password change
      if (!currentPassword) {
        return { success: false, error: 'Current password is required to change password' };
      }

      // Get user's current password from database
      const user = await db.getAsync(
        'SELECT user_password FROM users WHERE user_id = ?',
        [userId]
      );

      if (!user || !user.user_password) {
        return { success: false, error: 'Cannot change password for this account' };
      }

      // Verify current password
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.default.compare(currentPassword, user.user_password);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      if (password.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters' };
      }
      hashedPassword = await bcrypt.default.hash(password, 10);
    }

    const updateFields = [];
    const params = [];

    if (username) {
      updateFields.push('user_username = ?');
      params.push(username);
    }
    if (hashedPassword !== null) {
      updateFields.push('user_password = ?');
      params.push(hashedPassword);
    }
    if (profile_image) {
      updateFields.push('user_profile_image = ?');
      params.push(profile_image);
    }
    if (phone) {
      updateFields.push('user_phone = ?');
      params.push(phone.replace(/[\s-]/g, ''));
    }

    if (updateFields.length === 0) {
      return { success: false, error: 'No valid fields to update' };
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
    await db.runAsync(sql, params);

    // Fetch updated user data
    const updatedUser = await db.getAsync(
      'SELECT user_id, user_username, user_email, user_phone, user_profile_image, user_google_id FROM users WHERE user_id = ?',
      [userId]
    );

    // Generate new token with updated info
    const newToken = jwt.sign(
      {
        id: updatedUser.user_id,
        email: updatedUser.user_email,
        username: updatedUser.user_username,
        phone: updatedUser.user_phone
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token: newToken,
      user: {
        id: updatedUser.user_id,
        username: updatedUser.user_username,
        email: updatedUser.user_email,
        phone: updatedUser.user_phone || null,
        profile_image: updatedUser.user_profile_image || null,
        google_id: updatedUser.user_google_id || null
      }
    };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: 'Failed to update profile. Please try again.' };
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const user = await db.getAsync(
      'SELECT user_id, user_username, user_email, user_phone, user_profile_image, user_google_id, user_created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: {
        id: user.user_id,
        username: user.user_username,
        email: user.user_email,
        phone: user.user_phone || null,
        profile_image: user.user_profile_image || null,
        google_id: user.user_google_id || null,
        created_at: user.user_created_at
      }
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to retrieve profile. Please try again.' };
  }
};
