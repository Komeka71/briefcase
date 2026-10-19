const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'briefcase_svnit_secret_key_2026_dbms_project';

/**
 * Middleware to verify JWT authentication token
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

/**
 * Middleware for optional authentication (populates req.user if present)
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      // Ignore token errors for optional auth
    }
  }
  next();
}

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('Admin', 'Lawyer', 'Assistant', 'Staff')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for this operation.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(', ')}] role. Current role is '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  verifyToken,
  optionalAuth,
  requireRole,
  JWT_SECRET
};
