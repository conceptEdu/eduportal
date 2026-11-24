const express = require("express");
const router = express.Router();

const {
  getQuiz
} = require("../controllers/quizController");

router.get("/:chapterId", getQuiz);

module.exports = router;
