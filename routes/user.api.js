const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/", userController.createUser); // 회원가입
router.post("/login", userController.loginWithEmail); // 로그인

module.exports = router;
