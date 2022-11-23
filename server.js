require("dotenv").config();
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { Code } = require("mongodb");
var db;

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

MongoClient.connect(process.env.DB_URL, (error, client) => {
  if (error) {
    console.error(error);
    return process.exit();
  }
  db = client.db("toDoo");
  console.log("connected DB", db.namespace);

  app.listen(process.env.PORT, () => {
    console.log("listening on port " + process.env.PORT);
  });
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/mypage", loginCheck, (req, res) => {
  res.render("mypage.ejs", { user: req.user });
});

app.get("/posts/:id/edit", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (error, result) => {
      res.render("edit.ejs", { post: result });
      console.log(result);
    }
  );
});

app.get("/posts/:id", (req, res) => {
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    (error, result) => {
      res.render("detail.ejs", { post: result });
      console.log(result);
    }
  );
});

app.get("/posts", (req, res) => {
  db.collection("post")
    .find()
    .toArray((error, result) => {
      console.log(result);
      res.render("posts.ejs", { posts: result });
    });
});

app.post("/posts", (req, res) => {
  console.log(req.body);
  db.collection("counter").findOne({ name: "postCount" }, (error, result) => {
    console.log("현재 총 게시물 갯수 : " + result.totalPost);
    var count = parseInt(result.totalPost);
    db.collection("post").insertOne(
      { _id: count + 1, title: req.body.title, day: req.body.day },
      (req, res) => {
        console.log("저장완료");
        db.collection("counter").updateOne(
          { name: "postCount" },
          { $inc: { totalPost: 1 } },
          (error, result) => {
            console.log("저장 후 총 게시물 갯수 : " + (count + 1));
            if (error) {
              console.error(error);
              return process.exit();
            }
          }
        );
      }
    );
  });
});

app.delete("/posts", (req, res) => {
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, (error, result) => {
    console.log("삭제완료");
    res.status(200).send({ message: "삭제 성공했습니다." });
  });
});
app.put("/posts/:id/edit", (req, res) => {
  db.collection("post").updateOne(
    { _id: parseInt(req.params.id) },
    { $set: { title: req.body.title, day: req.body.day } },
    (error, result) => {
      if (error) {
        return console.error(error);
      }
      res.redirect("/posts");
      console.log("수정완료" + result);
    }
  );
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    // console.log("로그인 성공");
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    (reqId, reqPw, done) => {
      db.collection("user").findOne({ id: reqId }, function (error, result) {
        if (error) return done(error);
        if (!result)
          return done(null, false, {
            message: "존재하지않는 회원정보 입니다.",
          });
        if (reqPw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "알맞지 않는 회원정보 입니다." });
        }
      });
    }
  )
);

// 세션정보 저장하기
passport.serializeUser((user, done) => {
  console.log(user.id);
  return done(null, user.id);
});
// 세션정보 검증
passport.deserializeUser((sessionId, done) => {
  console.log("여기는 오나요?");
  db.collection("user").findOne({ id: sessionId }, (error, result) => {
    return done(null, result);
  });
});
// 로그인 검증
function loginCheck(req, res, next) {
  if (req.user) {
    console.log("로그인체크 지나감");
    next();
  } else {
    res.send("로그인이 필요합니다.");
  }
}
