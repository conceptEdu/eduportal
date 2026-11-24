const express = require("express");
const router = express.Router();

const {
  getStreams
} = require("../controllers/streamController");

router.get("/class/:classId", getStreams);

module.exports = router;
