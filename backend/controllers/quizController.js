const mongoose = require("mongoose");
const Question = require("../models/Question");
const Chapter = require("../models/Chapter");

// GET /api/quiz/:chapterId
const getQuiz = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.isValidObjectId(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chapter ID"
      });
    }

    const chapter = await Chapter.findOne({
      _id: chapterId,
      isActive: true
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter नहीं मिला"
      });
    }

    const questions = await Question.find({
      chapterId,
      isPublished: true
    })
      .select("question options  difficulty")
      .lean();

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Quiz प्राप्त नहीं हो सका",
      error: error.message
    });
  }
};

module.exports = { getQuiz };
