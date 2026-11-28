
const express = require("express");
const router = express.Router();

const {
  getAllStudents,
  getMyClassStudents
} = require("../controllers/studentController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// All routes require login
router.use(protect);

// All students: Admin and Teacher
router.get(
  "/",
  authorize("admin", "teacher"),
  getAllStudents
);

// Assigned class students: Teacher only
router.get(
  "/my-class",
  authorize("teacher"),
  getMyClassStudents
);

module.exports = router;
