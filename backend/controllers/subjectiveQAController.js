const mongoose = require("mongoose");
const SubjectiveQA = require("../models/SubjectiveQA");
const Chapter = require("../models/Chapter");

// GET Published Q&A by Chapter (Student)
const getQAByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chapter ID"
      });
    }

    const questions = await SubjectiveQA.find({
      chapterId,
      isPublished: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });

  } catch (error) {
    console.error("Get Q&A Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch questions"
    });
  }
};


// GET Teacher's Q&A Management List
const getManageQA = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { createdBy: req.user.userId };

    const questions = await SubjectiveQA.find(filter)
      .populate("chapterId", "title chapterNumber")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });

  } catch (error) {
    console.error("Manage Q&A Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch questions"
    });
  }
};


// CREATE Q&A
const createQA = async (req, res) => {
  try {
    const {
      chapterId,
      question,
      answer,
      language
    } = req.body;

    if (
      !chapterId ||
      !question?.trim() ||
      !answer?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Chapter, Question and Answer are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chapter ID"
      });
    }

    if (language && !["Hindi", "English"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language"
      });
    }

    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found"
      });
    }

    const newQA = await SubjectiveQA.create({
      chapterId,
      question: question.trim(),
      answer: answer.trim(),
      language: language || "Hindi",
      createdBy: req.user.userId,
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully as Draft",
      data: newQA
    });

  } catch (error) {
    console.error("Create Q&A Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create question"
    });
  }
};


// UPDATE Q&A
const updateQA = async (req, res) => {
  try {
    const { qaId } = req.params;
    const { question, answer, language, chapterId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(qaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Q&A ID"
      });
    }

    const filter = { _id: qaId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const qa = await SubjectiveQA.findOne(filter);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Question not found or access denied"
      });
    }

    if (question !== undefined) {
      if (typeof question !== "string" || !question.trim()) {
        return res.status(400).json({
          success: false,
          message: "Question cannot be empty"
        });
      }
      qa.question = question.trim();
    }

    if (answer !== undefined) {
      if (typeof answer !== "string" || !answer.trim()) {
        return res.status(400).json({
          success: false,
          message: "Answer cannot be empty"
        });
      }
      qa.answer = answer.trim();
    }

    if (language !== undefined) {
      if (!["Hindi", "English"].includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language"
        });
      }
      qa.language = language;
    }

    if (chapterId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(chapterId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Chapter ID"
        });
      }

      const chapter = await Chapter.findById(chapterId);

      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: "Chapter not found"
        });
      }

      qa.chapterId = chapterId;
    }

    await qa.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: qa
    });

  } catch (error) {
    console.error("Update Q&A Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update question"
    });
  }
};


// PUBLISH / UNPUBLISH Q&A
const togglePublishQA = async (req, res) => {
  try {
    const { qaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(qaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Q&A ID"
      });
    }

    const filter = { _id: qaId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const qa = await SubjectiveQA.findOne(filter);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Question not found or access denied"
      });
    }

    qa.isPublished = !qa.isPublished;

    await qa.save();

    res.status(200).json({
      success: true,
      message: qa.isPublished
        ? "Question published successfully"
        : "Question unpublished successfully",
      data: qa
    });

  } catch (error) {
    console.error("Publish Q&A Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to change publish status"
    });
  }
};


// DELETE Q&A
const deleteQA = async (req, res) => {
  try {
    const { qaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(qaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Q&A ID"
      });
    }

    const filter = { _id: qaId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const qa = await SubjectiveQA.findOneAndDelete(filter);

    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "Question not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully"
    });

  } catch (error) {
    console.error("Delete Q&A Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete question"
    });
  }
};


module.exports = {
  getQAByChapter,
  getManageQA,
  createQA,
  updateQA,
  togglePublishQA,
  deleteQA
};
