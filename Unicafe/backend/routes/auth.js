import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import db from '../database.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'unicafe-secret-key-2025'
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }

    const existingUser = await db.getAsync(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existingUser) {
      if (existingUser.email === email) return res.status(400).json({ error: 'Email already registered' })
      if (existingUser.username === username) return res.status(400).json({ error: 'Username already taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await db.runAsync(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    )

    const token = jwt.sign({ id: result.lastID, email, username }, JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastID, username, email }
    })
  } catch (error) {
    console.error('Registration error:', error)
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Email or username already exists' })
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' })

    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email])
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid email or password' })

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, profile_image: user.profile_image || null }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access token required' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' })
    req.user = user
    next()
  })
}

// Get user profile (requires authentication)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync('SELECT id, username, email, profile_image, created_at FROM users WHERE id = ?', [req.user.id])
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Failed to retrieve profile. Please try again.' })
  }
})

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'Google credential required' })

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const googleId = payload['sub']
    const email = payload['email']
    const name = payload['name']
    const picture = payload['picture'] || null

    let user = await db.getAsync('SELECT * FROM users WHERE google_id = ?', [googleId])

    if (!user) {
      user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email])
      if (user) {
        await db.runAsync('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id])
      }
    }

    if (!user) {
      const result = await db.runAsync('INSERT INTO users (username, email, password, google_id, profile_image) VALUES (?, ?, ?, ?, ?)', [name, email, '', googleId, picture])
      user = await db.getAsync('SELECT * FROM users WHERE id = ?', [result.lastID])
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ message: 'Google login successful', token, user: { id: user.id, username: user.username, email: user.email, profile_image: user.profile_image || null, google_id: user.google_id || null } })
  } catch (error) {
    console.error('Google login error:', error)
    res.status(500).json({ error: 'Google login failed. Please try again.' })
  }
})

// Update user profile (username, password, profile_image)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, password, profile_image } = req.body
    if (!username && !password && !profile_image) return res.status(400).json({ error: 'No profile data provided' })

    if (username) {
      if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' })
      const existingUser = await db.getAsync('SELECT id FROM users WHERE username = ? AND id != ?', [username, req.user.id])
      if (existingUser) return res.status(400).json({ error: 'Username already taken' })
    }

    let hashedPassword = null
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const updates = []
    const params = []
    if (username) { updates.push('username = ?'); params.push(username) }
    if (hashedPassword !== null) { updates.push('password = ?'); params.push(hashedPassword) }
    if (profile_image) { updates.push('profile_image = ?'); params.push(profile_image) }
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' })

    params.push(req.user.id)
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    await db.runAsync(sql, params)
    res.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Update profile error:', error)
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Username already exists' })
    res.status(500).json({ error: 'Failed to update profile. Please try again.' })
  }
})

export default router
