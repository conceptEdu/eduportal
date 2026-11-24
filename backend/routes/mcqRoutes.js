const express = require("express");
const router = express.Router();

const {
  getPublishedMCQs,
  getManageMCQs,
  createMCQ,
  updateMCQ,
  togglePublishMCQ,
  deleteMCQ,
  submitQuiz
} = require("../controllers/mcqController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// Student: Published MCQs
router.get("/chapter/:chapterId", getPublishedMCQs);

// Student: Submit Quiz
router.post("/submit", submitQuiz);

// Teacher/Admin: Manage MCQs
router.get(
  "/manage",
  protect,
  authorize("teacher", "admin"),
  getManageMCQs
);

router.post(
  "/",
  protect,
  authorize("teacher", "admin"),
  createMCQ
);

router.put(
  "/:mcqId",
  protect,
  authorize("teacher", "admin"),
  updateMCQ
);

router.patch(
  "/:mcqId/publish",
  protect,
  authorize("teacher", "admin"),
  togglePublishMCQ
);

router.delete(
  "/:mcqId",
  protect,
  authorize("teacher", "admin"),
  deleteMCQ
);

module.exports = router;
