const r = require("express").Router();
const auth = require("../middleware/auth");
const { validateTransaction, validatePagination } = require("../middleware/validate");
const c = require("../controllers/transactionController");

r.use(auth);
r.post("/", validateTransaction, c.create);
r.get("/", validatePagination, c.list);
r.get("/stats", c.stats);
r.post("/bulk", c.bulk);

module.exports = r;
