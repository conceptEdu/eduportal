const express = require("express");
const router = express.Router();

const {
  getSubjects
} = require("../controllers/subjectController");

router.get("/class/:classId", getSubjects);

module.exports = router;
