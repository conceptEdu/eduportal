const express = require("express");
const router = express.Router();

const {
  getNotesByChapter,
  getManageNotes,
  createNote,
  updateNote,
  togglePublishNote,
  deleteNote
} = require("../controllers/noteController");

const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// Student API - Published Notes
router.get("/chapter/:chapterId", getNotesByChapter);

// Teacher / Admin APIs
router.get(
  "/manage",
  protect,
  authorize("teacher", "admin"),
  getManageNotes
);

router.post(
  "/",
  protect,
  authorize("teacher", "admin"),
  createNote
);

router.put(
  "/:noteId",
  protect,
  authorize("teacher", "admin"),
  updateNote
);

router.patch(
  "/:noteId/publish",
  protect,
  authorize("teacher", "admin"),
  togglePublishNote
);

router.delete(
  "/:noteId",
  protect,
  authorize("teacher", "admin"),
  deleteNote
);

module.exports = router;
