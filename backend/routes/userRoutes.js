const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/validate");

// Profile validation middleware
const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("homeLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("homeLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
];

router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, validateProfileUpdate, handleValidationErrors, userController.updateProfile);

module.exports = router;
