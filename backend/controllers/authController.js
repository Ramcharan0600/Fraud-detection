const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      logger.warn(`Registration attempted with existing email: ${email}`);
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    logger.info(`New user registered: ${email}`);
    res.success(
      { message: "Registration successful. Please login to continue." },
      "User registered successfully",
      201
    );
  } catch (err) {
    logger.error("Registration error", { error: err.message, email: req.body.email });
    res.error(err, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const ok = await user.verifyPassword(password);
    if (!ok) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = sign(user);
    logger.info(`User logged in: ${email}`);
    
    res.success({
      token,
      user: { id: user._id, name: user.name, email },
    });
  } catch (err) {
    logger.error("Login error", { error: err.message, email: req.body.email });
    res.error(err, 500);
  }
};
