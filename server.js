require("dotenv").config();
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { Code } = require("mongodb");
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");
//소켓
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
var db;

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: false,
  })
);
// app.use("/", require("./main/routes/render.js"));
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

  http.listen(process.env.PORT, () => {
    console.log("listening on port " + process.env.PORT);
  });
});

const userIdValidat =
  // 세션정보 저장하기
  passport.serializeUser((user, done) => {
    console.log(user.userId);
    return done(null, user.userId);
  });

// 세션정보 검증
passport.deserializeUser((sessionId, done) => {
  console.log("여기는 오나요?");
  db.collection("user").findOne({ userId: sessionId }, (error, result) => {
    return done(null, result);
  });
});

// 로그인 검증
function loginCheck(req, res, next) {
  if (req.user) {
    console.log("로그인체크 지나감");
    next();
  } else {
    return res.send(
      "<script>alert('로그인이 필요합니다.'); window.location.replace('/login');</script>"
    );
  }
}

// app.get("/", (req, res) => {
//   res.render("index.ejs");
// });

app.get("/login", (req, res) => {
  if (req.user) {
    return res.send(
      "<script>alert('잘못된 접근입니다.'); window.location.replace('/');</script>"
    );
    // res.redirect("/");
  }
  res.render("login.ejs");
});

app.get("/logout", (req, res) => {
  req.logout();
  req.session.save((error) => {
    if (error) throw error;
    res.render("login.ejs");
  });
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/write", loginCheck, (req, res) => {
  res.render("write.ejs");
});

io.on("connection", (socket) => {
  console.log("소켓접속됨");

  socket.on("joinRoom", (data) => {
    console.log("서버조인", data);
    socket.join(data.roomId);
  });

  socket.on("userSend", (data) => {
    console.log(data.roomId + "에 보내기", data);
    console.log(data.message);
    var resData = {
      roomId: data.roomId,
      message: data.message,
      userId: data.userId,
    };
    io.to(data.roomId).emit("broadcast", resData);
  });

  // socket.on("user-send", (data) => {
  //   console.log("서버센드", data);
  //   io.emit("broadcast", data);
  //   // socket.join("room1"); // 생성,입장 가능함
  //   // io.to(socket.id).emit("broadcast", data); // 유니크 아이디를 이용해 1대1 하기
  // });
});

app.get("/chat", loginCheck, (req, res) => {
  db.collection("chatroom")
    .find({ member: req.user.userId })
    .toArray()
    .then((result) => {
      res.render("chat.ejs", { data: result, userId: req.user.userId });
    });
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

app.get("/search", (req, res) => {
  var searchCondition = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: "title",
        },
      },
    },
    { $project: { title: 1, _id: 0, score: { $meta: "searchScore" } } },
  ];
  console.log(req.query.value);
  db.collection("post")
    .aggregate(searchCondition)
    .toArray((error, result) => {
      console.log(result);
      res.render("search.ejs", { posts: result, userId: req.user.userId });
    });
});

app.get("/", (req, res) => {
  db.collection("post")
    .find()
    .toArray((error, result) => {
      console.log(result);
      if (!req.user) {
        res.render("posts.ejs", { posts: result, status: "none" });
      } else {
        res.render("posts.ejs", { posts: result, userId: req.user.userId });
      }
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
  // passport.use 로 넘어감
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    console.log("로그인 성공");
    res.redirect("/");
  }
);

// 로그인 유저정보 검증
passport.use(
  new LocalStrategy(
    {
      usernameField: "id", //폼에서 정의한 name속성
      passwordField: "pw",
      session: true, // 세션정보 저장 여부
      passReqToCallback: false, // 추가정보 검증 여부
    },
    (reqId, reqPw, done) => {
      db.collection("user").findOne(
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

app.post(
  "/signup/check/id",
  body("userId")
    .trim()
    .notEmpty()
    .withMessage("공백을 포함할 수 없습니다.")
    .isLength({ min: 4, max: 20 })
    .withMessage("아이디는 4~20자만 사용이 가능합니다.")
    .isAlphanumeric(),
  (req, res) => {
    console.log("응답", req.body);
    const errors = validationResult(req.body.userId);
    console.log("에러", errors);
    if (!errors.isEmpty()) {
      return res.send("404");
    } else {
      db.collection("user").findOne(
        { userId: req.body.userId },
        (error, result) => {
          console.log("리졀뜨", result);
          if (result) {
            return res.send(false);
          } else {
            return res.send(true);
          }
        }
      );
    }
  }
);

app.post(
  "/signup",
  [
    body("pw")
      .trim()
      .notEmpty()
      .withMessage("공백을 포함할 수 없습니다.")
      .isLength({ min: 6, max: 20 })
      .withMessage("비밀번호는 6~20자만 사용이 가능합니다."),
    body("email").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    console.log("에러", errors);
    if (!errors.isEmpty()) {
      return res.send("404");
    } else {
      const checkPw =
        /^.*(?=^.{6,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
      if (!checkPw.test(req.body.pw)) {
        return res.send("404");
      } else {
        db.collection("user").findOne(
          { userId: req.body.userId },
          (error, result) => {
            if (result) {
              return res.status(400).send({ message: "중복된 아이디 입니다." });
            } else {
              db.collection("user").insertOne(
                {
                  userId: req.body.userId,
                  pw: req.body.pw,
                  email: req.body.email,
                },
                (error, result) => {
                  console.log(result);
                  res.redirect("/login");
                }
              );
            }
          }
        );
      }
    }
  }
);

app.post("/posts", (req, res) => {
  console.log(req.body);
  db.collection("counter").findOne({ name: "postCount" }, (error, result) => {
    console.log("현재 총 게시물 갯수 : " + result.totalPost);
    var count = parseInt(result.totalPost);
    db.collection("post").insertOne(
      {
        _id: count + 1,
        title: req.body.title,
        day: req.body.day,
        userPk: req.user._id,
        userId: req.user.userId,
      },
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
    res.send("게시물 작성 완료됨");
  });
});

app.delete("/posts", (req, res) => {
  console.log("삭제요청", req.body);
  console.log(req.user._id);
  req.body._id = parseInt(req.body._id);
  var deleteData = { _id: req.body._id, userPk: req.user._id };
  db.collection("post").deleteOne(deleteData, (error, result) => {
    if (result.deletedCount <= 1) {
      res.send("different user");
    } else {
      console.log("삭제완료");
      console.log(result);
      res.status(200).send({ message: "삭제 성공했습니다." });
    }
  });
});

app.post("/chatroom", loginCheck, (req, res) => {
  var chatData = {
    title: "연습 채팅방",
    member: [req.body.roomUser, req.user.userId],
    date: new Date(),
  };
  console.log("여기 오나요?");
  db.collection("chatroom")
    .insertOne(chatData)
    .then((result) => {
      console.log(result);
    });
});

app.post("/message", loginCheck, (req, res) => {
  var messageData = {
    chatRoom: ObjectId(req.body.chatRoom),
    content: req.body.content,
    userId: req.user.userId,
    date: new Date(),
  };
  db.collection("message")
    .insertOne(messageData)
    .then((result) => {
      console.log("메시지저장 포스트요청 성공 ", result);
    })
    .catch((error) => {
      console.error(error);
      res.send("error");
    });
});

app.get("/message/:id", loginCheck, (req, res) => {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  db.collection("message")
    .find({
      chatRoom: ObjectId(req.params.id),
    })
    .toArray()
    .then((result) => {
      res.write("event: send\n");
      res.write(`data:${JSON.stringify(result)}\n\n`);
    });
  const watchRoom = [
    {
      $match: { "fullDocument.chatRoom": ObjectId(req.params.id) },
    },
  ];
  const changeStream = db.collection("message").watch(watchRoom);
  changeStream.on("change", (result) => {
    var newMessage = [result.FullDocument];
    console.log(result);
    console.log(result.FullDocument);
    res.write("event: send\n");
    res.write(`data:${JSON.stringify(newMessage)}\n\n`);
  });
});
