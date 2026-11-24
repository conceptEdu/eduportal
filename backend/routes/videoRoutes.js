const express = require("express");
const router = express.Router();

const {
  getVideosByChapter,
  getManageVideos,
  createVideo,
  updateVideo,
  togglePublishVideo,
  deleteVideo
} = require("../controllers/videoController");

const {protect} = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// Student: Published Videos
router.get("/chapter/:chapterId", getVideosByChapter);

// Teacher/Admin: Manage Videos
router.get(
  "/manage",
  protect,
  authorize("teacher", "admin"),
  getManageVideos
);

// Teacher/Admin: Create Video
router.post(
  "/",
  protect,
  authorize("teacher", "admin"),
  createVideo
);

// Teacher/Admin: Update Video
router.put(
  "/:videoId",
  protect,
  authorize("teacher", "admin"),
  updateVideo
);

// Teacher/Admin: Publish / Unpublish
router.patch(
  "/:videoId/publish",
  protect,
  authorize("teacher", "admin"),
  togglePublishVideo
);

// Teacher/Admin: Delete Video
router.delete(
  "/:videoId",
  protect,
  authorize("teacher", "admin"),
  deleteVideo
);

module.exports = router;
