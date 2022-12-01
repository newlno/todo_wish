const express = require("express");
const router = express.Router();
const validator = require("../config/validator");

const PostController = require("../controller/post");
const postController = new PostController();

// 글 작성 페이지 진입
router.get("/", validator.loginCheck, postController.writePage);

// 글 수정 페이지 진입
router.get("/:id/edit", validator.loginCheck, postController.editPage);

// 글 수정하기
router.put("/:id", validator.loginCheck, postController.editPost);

// 글 상세보기
router.get("/:id", validator.loginCheck, postController.detailPage);

// 글 작성
router.post("/", validator.loginCheck, postController.createPost);

// 글 삭제
router.delete("/", validator.loginCheck, postController.deletePost);

module.exports = router;
