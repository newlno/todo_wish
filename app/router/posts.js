const express = require("express");
const router = express.Router();
const validator = require("../config/validator");
const s3 = require("../config/s3");

const PostController = require("../controller/post");
const postController = new PostController();

// 글 작성 페이지 진입
router.get("/", validator.loginCheck, postController.writePage);

// 글 작성
router.post("/", validator.loginCheck, postController.createPost);

// 사진 업로드
router.post(
  "/image",
  //   validator.loginCheck,
  s3.upload.single("image"),
  postController.imageUpload
);

// 글 삭제
router.delete("/", validator.loginCheck, postController.deletePost);

// 글 수정 페이지 진입
router.get("/:id/edit", validator.loginCheck, postController.editPage);

// 글 수정하기
router.put("/:id", validator.loginCheck, postController.editPost);

// 글 상세보기
router.get("/:id", postController.detailPage);

module.exports = router;
