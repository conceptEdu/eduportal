const express = require("express");
const router = express.Router();

const {
  getQAByChapter,
  getManageQA,
  createQA,
  updateQA,
  togglePublishQA,
  deleteQA
} = require("../controllers/subjectiveQAController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// Student API - Published Q&A
router.get("/chapter/:chapterId", getQAByChapter);

// Teacher / Admin APIs
router.get(
  "/manage",
  protect,
  authorize("teacher", "admin"),
  getManageQA
);

router.post(
  "/",
  protect,
  authorize("teacher", "admin"),
  createQA
);

router.put(
  "/:qaId",
  protect,
  authorize("teacher", "admin"),
  updateQA
);

router.patch(
  "/:qaId/publish",
  protect,
  authorize("teacher", "admin"),
  togglePublishQA
);

router.delete(
  "/:qaId",
  protect,
  authorize("teacher", "admin"),
  deleteQA
);

module.exports = router;
