const { body, validationResult, query } = require("express-validator");

// Validation chains for transaction creation
const validateTransactionCreate = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage("Amount must be between 0.01 and 1,000,000"),
  body("merchant")
    .trim()
    .notEmpty()
    .withMessage("Merchant name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Merchant name must be 1-100 characters"),
  body("lat")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("lng")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  body("category")
    .optional()
    .isIn(["grocery", "electronics", "travel", "gambling", "atm", "online", "other"])
    .withMessage("Invalid category"),
  body("isOnline")
    .optional()
    .isBoolean()
    .withMessage("isOnline must be a boolean"),
];

// Validation chains for authentication
const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and numbers"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Validation for pagination
const validatePaginationQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Pagination middleware
const paginationMiddleware = (req, res, next) => {
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
  validateTransactionCreate,
  validateRegister,
  validateLogin,
  validatePaginationQuery,
  handleValidationErrors,
  paginationMiddleware,
};
