const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      logger.warn("Registration attempted with existing email", { email });
      return res.status(409).json({
        success: false,
        error: "Email already registered"
      });
    }

    // Hash password and create user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash
    });

    logger.info("New user registered", { userId: user._id, email });

    res.status(201).json({
      success: true,
      data: { message: "Registration successful. Please login to continue." },
      message: "User registered successfully"
    });
  } catch (err) {
    logger.error("Registration error", {
      error: err.message,
      email: req.body.email
    });
    
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logger.warn("Login attempt with non-existent email", { email });
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Verify password
    const ok = await user.verifyPassword(password);
    if (!ok) {
      logger.warn("Failed login attempt", { email, userId: user._id });
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Generate token
    const token = sign(user);
    logger.info("User logged in", { userId: user._id, email });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          homeLat: user.homeLat,
          homeLng: user.homeLng
        }
      },
      message: "Login successful"
    });
  } catch (err) {
    logger.error("Login error", {
      error: err.message,
      email: req.body.email
    });

    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
};
