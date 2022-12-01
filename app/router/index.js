const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const homeRouter = require("./home");
const postRouter = require("./posts");
const chatRouter = require("./chat");

router.use("/", homeRouter);
router.use("/user", userRouter);
router.use("/posts", postRouter);
router.use("/chat", chatRouter);

module.exports = router;
