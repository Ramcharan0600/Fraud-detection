const r = require("express").Router();
const auth = require("../middleware/auth");
const {
  validateTransactionCreate,
  handleValidationErrors,
  paginationMiddleware
} = require("../middleware/validate");
const c = require("../controllers/transactionController");

r.use(auth);
r.post("/", validateTransactionCreate, handleValidationErrors, c.create);
r.get("/", paginationMiddleware, c.list);
r.get("/stats", c.stats);
r.post("/bulk", validateTransactionCreate, handleValidationErrors, c.bulk);

module.exports = r;
