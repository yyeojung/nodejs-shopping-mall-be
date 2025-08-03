const authController = {};
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

authController.authenticate = (req, res, next) => {
  // 토큰 가져와서 유저찾기
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("invalid token");

    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("invalid token");
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    // token 값으로 어떤 유저인지 알 수 있음.
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level !== "admin") throw new Error("접근 권한이 없습니다.");
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

module.exports = authController;
