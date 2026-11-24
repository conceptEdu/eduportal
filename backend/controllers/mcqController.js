 const mongoose = require("mongoose");
const MCQ = require("../models/MCQ");

// Helper: Validate MongoDB ObjectId
const isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};

// Helper: Teacher only manages own MCQs.
// Admin manages all MCQs.
const canManageMCQ = (mcq, user) => {
  if (!mcq || !user) return false;

  if (user.role === "admin") return true;

  return (
    user.role === "teacher" &&
    mcq.createdBy &&
    String(mcq.createdBy) === String(user.userId)
  );
};

// Helper: Validate MCQ data
const validateMCQData = (data, isUpdate = false) => {
  if (!isUpdate) {
    if (!data.chapterId || !isValidId(data.chapterId)) {
      return "Valid Chapter ID is required.";
    }

    if (!data.question || !data.question.trim()) {
      return "Question is required.";
    }

    if (
      !Array.isArray(data.options) ||
      data.options.length !== 4 ||
      data.options.some(
        option =>
          typeof option !== "string" ||
          !option.trim()
      )
    ) {
      return "Exactly 4 non-empty options are required.";
    }

    if (
      !Number.isInteger(data.correctAnswer) ||
      data.correctAnswer < 0 ||
      data.correctAnswer > 3
    ) {
      return "Correct answer must be between 0 and 3.";
    }
  }

  if (
    isUpdate &&
    data.chapterId !== undefined &&
    !isValidId(data.chapterId)
  ) {
    return "Invalid Chapter ID.";
  }

  if (
    isUpdate &&
    data.question !== undefined &&
    (typeof data.question !== "string" || !data.question.trim())
  ) {
    return "Question cannot be empty.";
  }

  if (
    isUpdate &&
    data.options !== undefined &&
    (
      !Array.isArray(data.options) ||
      data.options.length !== 4 ||
      data.options.some(
        option =>
          typeof option !== "string" ||
          !option.trim()
      )
    )
  ) {
    return "Exactly 4 non-empty options are required.";
  }

  if (
    isUpdate &&
    data.correctAnswer !== undefined &&
    (
      !Number.isInteger(data.correctAnswer) ||
      data.correctAnswer < 0 ||
      data.correctAnswer > 3
    )
  ) {
    return "Correct answer must be between 0 and 3.";
  }

  if (
    data.language !== undefined &&
    !["Hindi", "English"].includes(data.language)
  ) {
    return "Language must be Hindi or English.";
  }

  if (
    data.displayOrder !== undefined &&
    (
      !Number.isInteger(data.displayOrder) ||
      data.displayOrder < 1
    )
  ) {
    return "Display order must be a positive integer.";
  }

  return null;
};

// 1. Student: Get Published MCQs
exports.getPublishedMCQs = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!isValidId(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chapter ID."
      });
    }

    const mcqs = await MCQ.find({
      chapterId,
      isPublished: true
    })
      .select("question options language displayOrder")
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: mcqs.length,
      data: mcqs
    });

  } catch (error) {
    console.error("Get Published MCQs:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch MCQs."
    });
  }
};

// 2. Teacher/Admin: Manage MCQs
exports.getManageMCQs = async (req, res) => {
  try {
    const filter = {};

    if (req.query.chapterId) {
      if (!isValidId(req.query.chapterId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Chapter ID."
        });
      }

      filter.chapterId = req.query.chapterId;
    }

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const mcqs = await MCQ.find(filter)
      .populate("chapterId", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: mcqs.length,
      data: mcqs
    });

  } catch (error) {
    console.error("Manage MCQs:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch MCQs."
    });
  }
};

// 3. Create MCQ
exports.createMCQ = async (req, res) => {
  try {
    const errorMessage = validateMCQData(req.body);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    if (!isValidId(req.user.userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user identity."
      });
    }

    const {
      chapterId,
      question,
      options,
      correctAnswer,
      explanation,
      language,
      displayOrder
    } = req.body;

    const mcq = await MCQ.create({
      chapterId,
      question: question.trim(),
      options: options.map(option => option.trim()),
      correctAnswer,
      explanation,
      language,
      displayOrder,
      createdBy: req.user.userId
    });

    return res.status(201).json({
      success: true,
      message: "MCQ created successfully.",
      data: mcq
    });

  } catch (error) {
    console.error("Create MCQ:", error.message);

    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Update MCQ
exports.updateMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;

    if (!isValidId(mcqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MCQ ID."
      });
    }

    const mcq = await MCQ.findById(mcqId);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found."
      });
    }

    if (!canManageMCQ(mcq, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this MCQ."
      });
    }

    const errorMessage = validateMCQData(req.body, true);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    const allowedFields = [
      "chapterId",
      "question",
      "options",
      "correctAnswer",
      "explanation",
      "language",
      "displayOrder"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        mcq[field] = req.body[field];
      }
    });

    await mcq.save();

    return res.status(200).json({
      success: true,
      message: "MCQ updated successfully.",
      data: mcq
    });

  } catch (error) {
    console.error("Update MCQ:", error.message);

    return res.status(
      error.name === "ValidationError" ? 400 : 500
    ).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Publish / Unpublish MCQ
exports.togglePublishMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;

    if (!isValidId(mcqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MCQ ID."
      });
    }

    const mcq = await MCQ.findById(mcqId);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found."
      });
    }

    if (!canManageMCQ(mcq, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    mcq.isPublished = !mcq.isPublished;

    await mcq.save();

    return res.status(200).json({
      success: true,
      message: mcq.isPublished
        ? "MCQ published successfully."
        : "MCQ unpublished successfully.",
      data: mcq
    });

  } catch (error) {
    console.error("Toggle Publish MCQ:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 6. Delete MCQ
exports.deleteMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;

    if (!isValidId(mcqId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MCQ ID."
      });
    }

    const mcq = await MCQ.findById(mcqId);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found."
      });
    }

    if (!canManageMCQ(mcq, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized."
      });
    }

    await mcq.deleteOne();

    return res.status(200).json({
      success: true,
      message: "MCQ deleted successfully."
    });

  } catch (error) {
    console.error("Delete MCQ:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 7. Student: Submit Quiz
exports.submitQuiz = async (req, res) => {
  try {
    const { chapterId, answers } = req.body;

    if (!chapterId || !isValidId(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Chapter ID is required."
      });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers are required."
      });
    }

    if (
      answers.some(item =>
        !item ||
        !isValidId(item.questionId) ||
        !Number.isInteger(item.selectedAnswer) ||
        item.selectedAnswer < 0 ||
        item.selectedAnswer > 3
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID or selected answer."
      });
    }

    const submittedIds = answers.map(
      item => String(item.questionId)
    );

    if (new Set(submittedIds).size !== submittedIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate question answers are not allowed."
      });
    }

    const mcqs = await MCQ.find({
      _id: { $in: submittedIds },
      chapterId,
      isPublished: true
    });

    if (mcqs.length !== answers.length) {
      return res.status(400).json({
        success: false,
        message: "Some questions are invalid or unpublished."
      });
    }

    const mcqMap = new Map(
      mcqs.map(mcq => [
        mcq._id.toString(),
        mcq
      ])
    );

    let score = 0;

    const results = answers.map(item => {
      const mcq = mcqMap.get(
        String(item.questionId)
      );

      const isCorrect =
        mcq.correctAnswer === item.selectedAnswer;

      if (isCorrect) score++;

      return {
        questionId: mcq._id,
        question: mcq.question,
        options: mcq.options,
        selectedAnswer: item.selectedAnswer,
        correctAnswer: mcq.correctAnswer,
        isCorrect,
        explanation: mcq.explanation
      };
    });

    const totalQuestions = mcqs.length;

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully.",
      result: {
        totalQuestions,
        attempted: answers.length,
        correct: score,
        incorrect: answers.length - score,
        score,
        percentage: Number(
          ((score / totalQuestions) * 100).toFixed(2)
        ),
        results
      }
    });

  } catch (error) {
    console.error("Submit Quiz:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit quiz."
    });
  }
};
