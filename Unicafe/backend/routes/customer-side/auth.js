import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import db from "../../database.js";
import { updateUserProfile } from "../../services/profileService.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "unicafe-secret-key-2025";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware to authenticate JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    console.log("[auth:register] incoming:", {
      username,
      email,
      phone,
      ip: req.ip,
    });

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Validate phone number format (basic validation for PH numbers)
    const phoneRegex = /^(\+63|0)?9\d{9}$/;
    const normalizedPhone = phone.replace(/[\s-]/g, "");
    if (!phoneRegex.test(normalizedPhone)) {
      return res
        .status(400)
        .json({
          error: "Invalid phone number format. Use format: 09XXXXXXXXX",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    }

    const existingUser = await db.getAsync(
      "SELECT * FROM users WHERE user_email = ? OR user_username = ?",
      [email, username]
    );
    console.log("[auth:register] existingUser:", existingUser);

    if (existingUser) {
      if (existingUser.user_email === email)
        return res.status(400).json({ error: "Email already registered" });
      if (existingUser.user_username === username)
        return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Always set profile_image to NULL for new registrations
    // Users must select avatar via ProfileSelection page after registration
    const result = await db.runAsync(
      "INSERT INTO users (user_username, user_email, user_phone, user_password, user_profile_image, user_role) VALUES (?, ?, ?, ?, NULL, 'customer')",
      [username, email, normalizedPhone, hashedPassword]
    );
    console.log("[auth:register] insert result:", result);

    if (!result || typeof result.lastID === "undefined") {
      throw new Error("Failed to create user");
    }

    const token = jwt.sign(
      { id: result.lastID, email, username, phone: normalizedPhone },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: result.lastID,
        username,
        email,
        phone: normalizedPhone,
        profile_image: null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === "SQLITE_CONSTRAINT")
      return res
        .status(400)
        .json({ error: "Email or username already exists" });
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    const user = await db.getAsync("SELECT * FROM users WHERE user_email = ?", [
      email,
    ]);
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isValidPassword = await bcrypt.compare(password, user.user_password);
    if (!isValidPassword)
      return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.user_email,
        username: user.user_username,
        phone: user.user_phone,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        username: user.user_username,
        email: user.user_email,
        phone: user.user_phone || null,
        profile_image: user.user_profile_image || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Get user profile (requires authentication)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync(
      "SELECT user_id, user_username, user_email, user_phone, user_profile_image, user_google_id, user_created_at FROM users WHERE user_id = ?",
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user.user_id,
      username: user.user_username,
      email: user.user_email,
      phone: user.user_phone || null,
      profile_image: user.user_profile_image || null,
      google_id: user.user_google_id || null,
      created_at: user.user_created_at,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve profile. Please try again." });
  }
});

// Google OAuth login
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ error: "Google credential required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];
    const picture = payload["picture"] || null;

    let user = await db.getAsync(
      "SELECT * FROM users WHERE user_google_id = ?",
      [googleId]
    );
    let isNewUser = false;

    if (!user) {
      user = await db.getAsync("SELECT * FROM users WHERE user_email = ?", [
        email,
      ]);
      if (user) {
        // Update existing user with Google ID and use Google's profile image
        await db.runAsync(
          "UPDATE users SET user_google_id = ?, user_profile_image = ? WHERE user_id = ?",
          [googleId, picture, user.user_id]
        );
        user = await db.getAsync("SELECT * FROM users WHERE user_id = ?", [
          user.user_id,
        ]);
      }
    }

    if (!user) {
      isNewUser = true;
      const result = await db.runAsync(
        "INSERT INTO users (user_username, user_email, user_password, user_google_id, user_profile_image, user_role) VALUES (?, ?, ?, ?, ?, 'customer')",
        [name, email, "", googleId, picture]
      );

      if (!result || typeof result.lastID === "undefined") {
        throw new Error("Failed to create user from Google login");
      }

      user = await db.getAsync("SELECT * FROM users WHERE user_id = ?", [
        result.lastID,
      ]);
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.user_email,
        username: user.user_username,
        phone: user.user_phone,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Check if user needs to add phone number
    const needsPhone = !user.user_phone;

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user.user_id,
        username: user.user_username,
        email: user.user_email,
        phone: user.user_phone || null,
        profile_image: user.user_profile_image || null,
        google_id: user.user_google_id || null,
      },
      needsPhone,
      isNewUser,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Google login failed. Please try again." });
  }
});

// Update user profile (username, password, profile_image, phone)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { username, password, currentPassword, profile_image, phone } = req.body;
    
    // Use profileService to handle the update
    const result = await updateUserProfile(req.user.id, {
      username,
      password,
      currentPassword,
      profile_image,
      phone,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: "Profile updated successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to update profile. Please try again." });
  }
});

export default router;
