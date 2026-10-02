const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

/**
 * Admin Login
 * POST /api/admin/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check user in database
    const result = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Enforce ADMIN role only
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators can log in to this portal.',
      });
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'college_admin_secure_jwt_token_key_2026_xyz',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logActivity('Admin Login', `Admin ${user.name} logged into the system`, 'user', user.id);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current admin user profile
 * GET /api/admin/me
 */
async function getMe(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update Admin Profile or Password
 * PUT /api/admin/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = userRes.rows[0];

    let updatedName = name ? name.trim() : user.name;
    let updatedEmail = email ? email.trim() : user.email;
    let hashedPassword = user.password;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password.',
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(newPassword, salt);
    }

    const updateRes = await db.query(
      `UPDATE users
       SET name = $1, email = $2, password = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, email, role, updated_at`,
      [updatedName, updatedEmail, hashedPassword, userId]
    );

    logActivity('Profile Updated', `Admin profile was updated`, 'user', userId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { login, getMe, updateProfile };
