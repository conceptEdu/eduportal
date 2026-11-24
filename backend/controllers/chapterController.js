const Chapter = require("../models/Chapter");

// GET: किसी Subject के Chapters
const getChapters = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const chapters = await Chapter.find({
      subjectId,
      isActive: true
    }).sort({ chapterNumber: 1 });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getChapters };
