const { verifyToken } = require('../utils/auth');
const Users = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Backward compatibility for tokens issued before role was embedded.
    if (!decoded.role && decoded.userId) {
      const dbUser = await Users.findById(decoded.userId);
      if (dbUser) {
        decoded.role = dbUser.role;
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
