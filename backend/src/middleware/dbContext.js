const { pools } = require('../config/db');

/**
 * Database Context Middleware
 * Maps the authenticated user's role to the appropriate least-privilege connection pool,
 * and sets session context variables (@app_user_id, @app_role) on every request.
 */
function attachDb(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required for database operations.'
    });
  }

  const role = req.user.role;
  const userId = req.user.userId || req.user.user_id;

  let selectedPool;
  if (role === 'Admin') {
    selectedPool = pools.admin;
  } else if (role === 'Lawyer') {
    selectedPool = pools.lawyer;
  } else if (role === 'Assistant' || role === 'Staff') {
    selectedPool = pools.staff;
  } else {
    return res.status(403).json({
      success: false,
      message: `Forbidden: Unrecognized or unauthorized user role '${role}'.`
    });
  }

  // Attach scoped db interface
  req.db = {
    async query(sql, params) {
      const conn = await selectedPool.getConnection();
      try {
        await conn.query('SET @app_user_id = ?, @app_role = ?', [userId, role]);
        return await conn.query(sql, params);
      } finally {
        conn.release();
      }
    },
    async getConnection() {
      const conn = await selectedPool.getConnection();
      await conn.query('SET @app_user_id = ?, @app_role = ?', [userId, role]);
      return conn;
    },
    pool: selectedPool
  };

  req.dbPool = selectedPool;
  next();
}

module.exports = {
  attachDb
};
