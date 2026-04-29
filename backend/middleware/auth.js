const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Missing or invalid authorization header"
      });
    }

    const token = header.slice(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        logger.warn("Auth attempt with non-existent user", { userId: decoded.id });
        return res.status(401).json({
          success: false,
          error: "User not found"
        });
      }

      req.user = user;
      next();
    } catch (jwtErr) {
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token expired"
        });
      }
      throw jwtErr;
    }
  } catch (e) {
    logger.error("Authentication error", { error: e.message });
    res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }
};
