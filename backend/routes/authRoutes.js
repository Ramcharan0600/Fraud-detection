const r = require("express").Router();
const { validateAuth } = require("../middleware/validate");
const c = require("../controllers/authController");

r.post("/register", validateAuth, c.register);
r.post("/login", validateAuth, c.login);

module.exports = r;
