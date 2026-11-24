const Video = require("../models/Video");

// YouTube URL से Video ID निकालना
const getYouTubeVideoId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = parsedUrl.pathname.split("/")[1];
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsedUrl.pathname === "/watch") {
        videoId = parsedUrl.searchParams.get("v");
      } else {
        const parts = parsedUrl.pathname.split("/");
        if (["embed", "shorts", "live"].includes(parts[1])) {
          videoId = parts[2];
        }
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(videoId || "")
      ? videoId
      : null;
  } catch {
    return null;
  }
};


// 1. Student: Chapter के Published Videos देखना
exports.getVideosByChapter = async (req, res) => {
  try {
    const videos = await Video.find({
      chapterId: req.params.chapterId,
      isPublished: true
    })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select("-createdBy");

    res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Videos प्राप्त करने में समस्या हुई।"
    });
  }
};


// 2. Teacher: सभी Videos Manage करना
exports.getManageVideos = async (req, res) => {
  try {
    const filter = {};

    if (req.query.chapterId) {
      filter.chapterId = req.query.chapterId;
    }

    const videos = await Video.find(filter)
      .populate("chapterId", "title")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Videos प्राप्त करने में समस्या हुई।"
    });
  }
};


// 3. Teacher: नया Video जोड़ना
exports.createVideo = async (req, res) => {
  try {
    const {
      title,
      youtubeUrl,
      chapterId,
      description,
      language,
      displayOrder
    } = req.body;

    if (!title || !youtubeUrl || !chapterId) {
      return res.status(400).json({
        success: false,
        message: "Title, YouTube URL और Chapter आवश्यक हैं।"
      });
    }

    const youtubeVideoId = getYouTubeVideoId(youtubeUrl);

    if (!youtubeVideoId) {
      return res.status(400).json({
        success: false,
        message: "कृपया सही YouTube Video URL डालें।"
      });
    }

    const video = await Video.create({
      title,
      youtubeUrl,
      youtubeVideoId,
      chapterId,
      description,
      language,
      displayOrder,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: "Video सफलतापूर्वक जोड़ा गया।",
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Video जोड़ने में समस्या हुई।"
    });
  }
};


// 4. Teacher: Video Update करना
exports.updateVideo = async (req, res) => {
  try {
    const {
      title,
      youtubeUrl,
      chapterId,
      description,
      language,
      displayOrder
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (chapterId !== undefined) updates.chapterId = chapterId;
    if (description !== undefined) updates.description = description;
    if (language !== undefined) updates.language = language;
    if (displayOrder !== undefined) updates.displayOrder = displayOrder;

    if (youtubeUrl !== undefined) {
      const youtubeVideoId = getYouTubeVideoId(youtubeUrl);

      if (!youtubeVideoId) {
        return res.status(400).json({
          success: false,
          message: "कृपया सही YouTube Video URL डालें।"
        });
      }

      updates.youtubeUrl = youtubeUrl;
      updates.youtubeVideoId = youtubeVideoId;
    }

    const video = await Video.findByIdAndUpdate(
      req.params.videoId,
      updates,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video नहीं मिला।"
      });
    }

    res.status(200).json({
      success: true,
      message: "Video सफलतापूर्वक Update हुआ।",
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Video Update करने में समस्या हुई।"
    });
  }
};


// 5. Teacher: Publish / Unpublish करना
exports.togglePublishVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video नहीं मिला।"
      });
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json({
      success: true,
      message: video.isPublished
        ? "Video Published हो गया।"
        : "Video Unpublished हो गया।",
      video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Publish Status बदलने में समस्या हुई।"
    });
  }
};


// 6. Teacher: Video Delete करना
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video नहीं मिला।"
      });
    }

    res.status(200).json({
      success: true,
      message: "Video सफलतापूर्वक Delete हुआ।"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Video Delete करने में समस्या हुई।"
    });
  }
};

