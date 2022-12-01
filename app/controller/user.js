class UserController {
  // 로그인 실행
  login = (req, res, next) => {
    console.log("유저라우터 로그인 성공");
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
    res.render("myPage.ejs", { user: req.user });
  };

  // 회원가입 메일 인증번호 받기
  mailAuthNum = (req, res) => {
    console.log("메일인증 리퀘", req.body);
    if (!validator.checkMail(req.body.email)) {
      console.log("메일 벨리실패 404");
      return res.send("404");
    } else {
      req.app.db
        .collection("user")
        .findOne({ email: req.body.email }, (error, result) => {
          console.log("리졀뜨", result);
          if (!result == null) {
            res.send("overlap");
          } else {
            var deleteData = { email: req.body.email };
            req.app.db.collection("authnum").deleteMany(deleteData);
          }
          const authNumber = Math.floor(Math.random() * 888888) + 111111;
          mail.snedMail(req, authNumber);
          console.log("메일센드 지나가나요?");
          req.app.db.collection("authnum").insertOne(
            {
              email: req.body.email,
              num: authNumber,
            },
            (error, result) => {
              console.log(result);
            }
          );
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
    console.log("인증번호응답", req.body);
    req.app.db
      .collection("authnum")
      .findOne({ num: req.body.authnum }, (error, result) => {
        console.log("리졀뜨", result);
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
    console.log("응답", req.body);
    if (!validator.checkId(req.body.userId)) {
      console.log("아디 벨리실패 404");
      return res.send("404");
    } else {
      req.app.db
        .collection("user")
        .findOne({ userId: req.body.userId }, (error, result) => {
          console.log("리졀뜨", result);
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
      !validator.checkMail(req.body.email) ||
      !validator.checkId(req.body.userId) ||
      !validator.checkPw(req.body.pw)
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
                console.log(result);
                return res.send(true);
              }
            );
          }
        });
    }
  };
}

module.exports = UserController;
