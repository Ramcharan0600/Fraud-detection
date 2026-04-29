const r = require("express").Router();
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require("../middleware/validate");
const c = require("../controllers/authController");

r.post("/register", validateRegister, handleValidationErrors, c.register);
r.post("/login", validateLogin, handleValidationErrors, c.login);

module.exports = r;
