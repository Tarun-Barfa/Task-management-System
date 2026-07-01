const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Checks the request has a valid JWT before letting it through
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // "Bearer <token>" → just the token
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // attach user to the request

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

// Checks the logged-in user's role matches what's allowed
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Role '${req.user.role}' not allowed here` });
    }
    next();
  };
};

module.exports = { protect, authorize };