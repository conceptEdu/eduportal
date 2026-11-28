
const express = require("express");
const router = express.Router();

const {
  createSection,
  getSections,
  deactivateSection
} = require("../controllers/sectionController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// All routes require Admin login
router.use(protect);
router.use(authorize("admin"));

// Create Section
router.post("/", createSection);

// Get Sections
router.get("/", getSections);

// Deactivate Section
router.patch("/:id/deactivate", deactivateSection);

module.exports = router;
