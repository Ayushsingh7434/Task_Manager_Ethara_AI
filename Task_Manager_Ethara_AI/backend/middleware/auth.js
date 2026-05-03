const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect - Verify JWT and attach full user to req.user
 */
const protect = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ success: false, message: "No token, authorization denied" });
  }

  // Handle "Bearer <token>" format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB so req.user.role and req.user._id are always available
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

/**
 * authorize - Check if user has required role(s)
 * Usage: authorize('admin') or authorize('admin', 'member')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
