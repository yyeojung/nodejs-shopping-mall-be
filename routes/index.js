const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const productApi = require("./product.api");

router.use("/users", userApi);
router.use("/product", productApi);

module.exports = router;
