const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/", userController.createUser); // 회원가입
router.post("/login", userController.loginWithEmail); // 로그인
router.get("/me", authController.authenticate, userController.getUser); // 토큰이 void한 토큰인지, 이 token가지고 유저를 찾아서 리턴
router.post("/google", userController.loginWithGoogle); // 구글 로그인

module.exports = router;
