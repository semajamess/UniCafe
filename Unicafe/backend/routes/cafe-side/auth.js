import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../database.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "unicafe-admin-secret-key-2025";

// Admin login (from users table with admin role)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Check user credentials - must have admin role
    const user = await db.getAsync(
      "SELECT * FROM users WHERE (user_username = ? OR user_email = ?) AND user_role = 'admin' AND user_deleted_at IS NULL",
      [username, username]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.user_password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.user_id, username: user.user_username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        username: user.user_username,
        name: user.user_username,
        email: user.user_email,
        role: user.user_role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Verify token
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided", valid: false });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ error: "Invalid or expired token", valid: false });
      }

      // Check if user still exists and has admin role
      const user = await db.getAsync(
        "SELECT user_id, user_username, user_email, user_role FROM users WHERE user_id = ? AND user_role = 'admin'",
        [decoded.id]
      );

      if (!user) {
        return res.status(404).json({ error: "Admin not found", valid: false });
      }

      res.json({
        valid: true,
        user: {
          id: user.user_id,
          username: user.user_username,
          name: user.user_username,
          email: user.user_email,
          role: user.user_role,
        },
      });
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Verification failed", valid: false });
  }
});

// Logout (client-side will clear token)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
