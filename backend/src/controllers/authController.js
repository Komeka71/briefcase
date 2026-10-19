const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const authController = {
  // Requirement 10.3: Register Application User
  register: async (req, res, next) => {
    try {
      const { name, email, password, role, status } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and role are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }

      // Hash password with bcrypt salt rounds = 10
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const connection = await pool.getConnection();
      try {
        await connection.query('SET @new_user_id = 0');
        const [results] = await connection.query(
          'CALL RegisterUser(?, ?, ?, ?, ?, @new_user_id)',
          [name, email, passwordHash, role, status || 'Active']
        );
        const [outResult] = await connection.query('SELECT @new_user_id AS new_user_id');
        const newUserId = outResult[0]?.new_user_id;
        const userRow = results[0]?.[0];

        // Generate JWT token
        const token = jwt.sign(
          { userId: newUserId, name: userRow.name, email: userRow.email, role: userRow.role },
          JWT_SECRET,
          { expiresIn: '8h' }
        );

        return res.status(201).json({
          success: true,
          message: 'User registered successfully via Stored Procedure RegisterUser.',
          token,
          user: userRow
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.3: Login Application User
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required.'
        });
      }

      // Retrieve user hash via stored procedure GetUserByEmail
      const [results] = await pool.query('CALL GetUserByEmail(?)', [email]);
      const user = results[0]?.[0];

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      if (user.status !== 'Active') {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated or suspended. Contact Law Firm DBA.'
        });
      }

      // Verify bcrypt password hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      // Sign JWT token
      const token = jwt.sign(
        { userId: user.user_id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Current Authenticated User Profile
  getMe: async (req, res, next) => {
    try {
      const [results] = await pool.query(
        'SELECT user_id, name, email, role, status, created_at FROM USERS WHERE user_id = ?',
        [req.user.userId]
      );
      const user = results[0];
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  },

  // List all users via stored procedure GetAllUsers (Admin view)
  getAllUsers: async (req, res, next) => {
    try {
      const [results] = await pool.query('CALL GetAllUsers()');
      const users = results[0] || [];
      return res.json({ success: true, count: users.length, data: users });
    } catch (error) {
      next(error);
    }
  },

  // Delete user via stored procedure DeleteUser
  deleteUser: async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const [results] = await pool.query('CALL DeleteUser(?)', [userId]);
      const message = results[0]?.[0]?.message || 'User deleted.';
      return res.json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
