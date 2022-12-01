const express = require("express");
const router = express.Router();

const HomeController = require("../controller/home");
const homeController = new HomeController();

// 홈
router.get("/", homeController.home);

// 검색기능
router.get("/search", homeController.search);

module.exports = router;
