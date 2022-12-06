const validator = require("../config/validator");
const mail = require("../config/mail");

class UserController {
  // 로그인 실행
  login = (req, res, next) => {
    res.redirect("/");
  };

  // 회원가입 페이지 진입
  signupPage = (req, res) => {
    if (req.user) {
      return res.send(
        "<script>alert('잘못된 접근입니다.'); window.location.replace('/');</script>"
      );
    }
    res.render("signup.ejs");
  };

  // 로그인 페이지 진입
  loginPage = (req, res) => {
    if (req.user) {
      return res.send(
        "<script>alert('잘못된 접근입니다.'); window.location.replace('/');</script>"
      );
    }
    res.render("login.ejs");
  };

  // 로그아웃 실행
  logout = (req, res) => {
    req.logout((error) => {
      req.session.destroy((error) => {
        if (error) throw error;
        res.clearCookie("connect.sid");
        res.render("login.ejs");
      });
    });
  };

  // 마이페이지 진입
  myPage = (req, res) => {
    var sort = { _id: -1 };
    req.app.db
      .collection("post")
      .find({ userId: req.user.userId })
      .sort(sort)
      .toArray()
      .then((result) => {
        res.render("myPage.ejs", { user: req.user, post: result });
      });
  };

  // 회원가입 메일 인증번호 받기
  mailAuthNum = (req, res) => {
    if (!validator.check.checkMail(req.body.email)) {
      return res.send("404");
    } else {
      req.app.db
        .collection("user")
        .findOne({ email: req.body.email }, (error, result) => {
          if (!result == null) {
            res.send("overlap");
          } else {
            var deleteData = { email: req.body.email };
            req.app.db.collection("authnum").deleteMany(deleteData);
          }
          const authNumber = Math.floor(Math.random() * 888888) + 111111;
          mail.snedMail(req, authNumber);
          req.app.db.collection("authnum").insertOne({
            email: req.body.email,
            num: authNumber,
          });
        });
    }
    res.send(true);
  };

  // 회원가입 메일 인증번호 검증
  mailAuthNumCheck = (req, res) => {
    req.body.authnum = parseInt(req.body.authnum);
    if (isNaN(req.body.authnum)) {
      return res.send(false);
    }
    req.app.db
      .collection("authnum")
      .findOne({ num: req.body.authnum }, (error, result) => {
        if (result == null) {
          return res.send(false);
        } else if (result.num == parseInt(req.body.authnum)) {
          var deleteData = { num: parseInt(req.body.authnum) };
          req.app.db.collection("authnum").deleteOne(deleteData);
          return res.send(true);
        } else {
          return res.send(false);
        }
      });
  };

  // 회원가입 아이디 중복확인
  checkId = (req, res) => {
    if (!validator.check.checkId(req.body.userId)) {
      return res.send("404");
    } else {
      req.app.db
        .collection("user")
        .findOne({ userId: req.body.userId }, (error, result) => {
          if (result) {
            return res.send(false);
          } else {
            return res.send(true);
          }
        });
    }
  };

  // 회원가입 최종 확인
  signup = (req, res) => {
    if (
      !validator.check.checkMail(req.body.email) ||
      !validator.check.checkId(req.body.userId) ||
      !validator.check.checkPw(req.body.pw)
    ) {
      return res.send("404");
    } else {
      req.app.db
        .collection("user")
        .findOne({ userId: req.body.userId }, (error, result) => {
          if (result) {
            return res.status(400).send({ message: "중복된 아이디 입니다." });
          } else {
            req.app.db.collection("user").insertOne(
              {
                userId: req.body.userId,
                pw: req.body.pw,
                email: req.body.email,
              },
              (error, result) => {
                return res.send(true);
              }
            );
          }
        });
    }
  };
}

module.exports = UserController;
