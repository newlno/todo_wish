const express = require("express");
const router = express.Router();
const validator = require("../config/validator");

const ChatController = require("../controller/chat");
const chatController = new ChatController();

// 채팅 페이지 진입
router.get("/", validator.loginCheck, chatController.chatPage);

// 채팅방 생성
router.post("/room", validator.loginCheck, chatController.createRoom);

// 채팅방 삭제
router.delete("/room", validator.loginCheck, chatController.deleteRoom);

// 채팅내역 가져오기
router.post("/list", validator.loginCheck, chatController.chatList);

module.exports = router;
