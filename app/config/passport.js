module.exports = (app) => {
  //passport - 무조건 session 밑에 작성해야함!
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;
  app.use(passport.initialize());
  app.use(passport.session());

  //local-login 에서 받은 정보를 session 저장
  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  //각 페이지 들어갈때마다 보여지는 session
  passport.deserializeUser((sessionId, done) => {
    app.db
      .collection("user")
      .findOne({ userId: sessionId }, (error, result) => {
        return done(null, result);
      });
  });

  // 로그인 유저정보 검증
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "id",
        passwordField: "pw",
        session: true, // 세션정보 저장 여부
      },
      function (reqId, reqPw, done) {
        app.db.collection("user").findOne(
          { userId: reqId }, // db에 정의한 키 벨류값
          function (error, result) {
            if (error) return done(error);
            if (!result)
              return done(null, false, {
                message: "존재하지않는 회원정보 입니다.",
              });
            if (reqPw == result.pw) {
              return done(null, result);
            } else {
              return done(null, false, {
                message: "알맞지 않는 회원정보 입니다.",
              });
            }
          }
        );
      }
    )
  );
};
