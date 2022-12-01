const express = require("express");
const router = express.Router();
const passport = require("passport");
const mail = require("../config/mail");
const validator = require("../config/validator");

const UserController = require("../controller/user");
const userController = new UserController();

// 로그인 실행
router.post(
  "/login",
  // passport모듈을 직접 사용해야함 passport.use 로 넘어감
  passport.authenticate("local-login", {
    failureRedirect: "/user/signup",
    failureFlash: true,
  }),
  userController.login
);

// 회원가입 페이지 진입
router.get("/signup", userController.signupPage);

// 로그인 페이지 진입
router.get("/login", userController.loginPage);

// 로그아웃 실행
router.post("/logout", validator.loginCheck, userController.logout);

// 마이페이지 진입
router.get("/mypage", validator.loginCheck, userController.myPage);

// 회원가입 메일 인증번호 받기
router.post("/signup/check/email", userController.mailAuthNum);

// 회원가입 메일 인증번호 검증
router.post("/signup/check/email/auth", userController.mailAuthNumCheck);

// 회원가입 아이디 중복확인
router.post("/signup/check/id", userController.checkId);

// 회원가입 최종 확인
router.post("/signup", userController.signup);

module.exports = router;
