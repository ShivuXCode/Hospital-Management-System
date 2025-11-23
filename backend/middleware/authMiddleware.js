const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT Token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure user still exists (revokes tokens for deleted users)
    const user = await User.findById(decoded.id).select('_id role');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log(`🔒 Authorization check - User role: "${req.user.role}", Allowed roles: [${roles.map(r => `"${r}"`).join(', ')}]`);
    if (!roles.includes(req.user.role)) {
      console.log(`❌ Authorization failed for role: "${req.user.role}"`);
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`
      });
    }
    console.log(`✅ Authorization passed for role: "${req.user.role}"`);
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
