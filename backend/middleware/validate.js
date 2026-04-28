// Input validation middleware
const validateTransaction = (req, res, next) => {
  const { amount, merchant, category, lat, lng } = req.body;
  
  // Check required fields
  if (amount == null || !merchant || lat == null || lng == null) {
    return res.status(400).json({ success: false, error: "Missing required fields: amount, merchant, lat, lng" });
  }

  // Validate amount
  if (typeof amount !== "number" || amount <= 0 || amount > 1000000) {
    return res.status(400).json({ success: false, error: "Amount must be between 0 and 1,000,000" });
  }

  // Validate merchant name
  if (typeof merchant !== "string" || merchant.trim().length === 0 || merchant.length > 100) {
    return res.status(400).json({ success: false, error: "Merchant name must be 1-100 characters" });
  }

  // Validate coordinates
  if (typeof lat !== "number" || lat < -90 || lat > 90) {
    return res.status(400).json({ success: false, error: "Latitude must be between -90 and 90" });
  }

  if (typeof lng !== "number" || lng < -180 || lng > 180) {
    return res.status(400).json({ success: false, error: "Longitude must be between -180 and 180" });
  }

  // Validate category if provided
  const validCategories = ["grocery", "electronics", "travel", "gambling", "atm", "online", "other"];
  if (req.body.category && !validCategories.includes(req.body.category)) {
    return res.status(400).json({ success: false, error: `Category must be one of: ${validCategories.join(", ")}` });
  }

  next();
};

const validateAuth = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
  }

  if (req.body.name && (typeof req.body.name !== "string" || req.body.name.trim().length === 0)) {
    return res.status(400).json({ success: false, error: "Name must be a non-empty string" });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  if (page < 1) {
    return res.status(400).json({ success: false, error: "Page must be >= 1" });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: "Limit must be between 1 and 100" });
  }

  req.pagination = { page, limit };
  next();
};

module.exports = {
  validateTransaction,
  validateAuth,
  validatePagination,
};
