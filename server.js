require("dotenv").config();
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const session = require("express-session");

//db
const MongoClient = require("mongodb").MongoClient;
// const { ObjectId } = require("mongodb");
var db;

//소켓
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const socket = require("./app/config/socket");
socket(Server, http);

//session
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: false,
  })
);
// passport
const passport = require("./app/config/passport")(app);

app.set("views", "./app/views");
app.set("view engine", "ejs");
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// DB & server_On
MongoClient.connect(process.env.DB_URL, (error, client) => {
  if (error) {
    console.error(error);
    return process.exit();
  }
  db = client.db("toDoo");
  app.db = db;
  console.log("connected DB", db.namespace);

  http.listen(process.env.PORT, () => {
    console.log("listening on port " + process.env.PORT);
  });
});

//라우터
const Router = require("./app/router/index");
app.use("/", Router);

module.exports = app;
