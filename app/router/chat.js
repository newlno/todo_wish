const express = require("express");
const router = express.Router();
const validator = require("../config/validator");

const ChatController = require("../controller/chat");
const chatController = new ChatController();

// 채팅 페이지 진입
router.get("/", validator.loginCheck, chatController.chatPage);

// 채팅방 생성
router.post("/room", validator.loginCheck, chatController.createRoom);

module.exports = router;
