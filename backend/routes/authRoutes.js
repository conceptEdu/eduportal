const express = require("express");
const router = express.Router();

const {
  createStudentAdmission,
  importStudentAdmissionsFile,
  importStudentAdmissionsSheet,
  importStudentAdmissionsPaste
} = require("../controllers/studentAdmissionController");

const {
  verifyStudentAdmission,
  registerStudent
} = require("../controllers/studentAuthController");

const upload = require("../middlewares/uploadMiddleware");

const {
  loginTeacher,
  createTeacher,
  loginStudent
} = require("../controllers/authController");


const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// Teacher Login
router.post("/teacher-login", loginTeacher);

// Student Login
router.post("/student/login", loginStudent);

// Auth Test
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working"
  });
});

// Create Teacher
router.post(
  "/create-teacher",
  protect,
  authorize("admin"),
  createTeacher
);

// Create Student Admission
router.post(
  "/create-student-admission",
  protect,
  authorize("admin", "teacher"),
  createStudentAdmission
);

// Excel / CSV Bulk Import
router.post(
  "/bulk-student-admission/file",
  protect,
  authorize("admin", "teacher"),
  upload.single("file"),
  importStudentAdmissionsFile
);

// Google Sheets Bulk Import
router.post(
  "/bulk-student-admission/sheet",
  protect,
  authorize("admin", "teacher"),
  importStudentAdmissionsSheet
);

// Copy-Paste Bulk Import
router.post(
  "/bulk-student-admission/paste",
  protect,
  authorize("admin", "teacher"),
  importStudentAdmissionsPaste
);

// Student Admission Verification
router.post(
  "/student/verify-admission",
  verifyStudentAdmission
);

// Student Registration after Firebase OTP Verification
router.post(
  "/student/register",
  registerStudent
);

module.exports = router;

