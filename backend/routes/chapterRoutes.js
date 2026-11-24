const express = require("express");
const router = express.Router();

const {
  getChapters
} = require("../controllers/chapterController");

router.get("/subject/:subjectId", getChapters);

module.exports = router;
