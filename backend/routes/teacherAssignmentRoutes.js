
const express = require("express");
const router = express.Router();

const {
  createTeacherAssignment,
  getTeacherAssignments,
  deactivateTeacherAssignment
} = require("../controllers/teacherAssignmentController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// All routes require Admin login
router.use(protect);
router.use(authorize("admin"));

// Create Assignment
router.post("/", createTeacherAssignment);

// Get All Assignments
router.get("/", getTeacherAssignments);

// Deactivate Assignment
router.patch("/:id/deactivate", deactivateTeacherAssignment);

module.exports = router;
