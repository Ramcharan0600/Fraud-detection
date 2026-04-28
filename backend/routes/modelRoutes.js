const r = require("express").Router();
const c = require("../controllers/modelController");
r.get("/evaluate", c.evaluate);
module.exports = r;
