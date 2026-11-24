const MCQ = require("../models/MCQ");

// Helper: Teacher केवल अपने MCQ manage करेगा.
// Admin सभी MCQ manage कर सकता है.
const canManageMCQ = async (mcq, user) => {
  if (!mcq || !user) return false;

  if (user.role === "admin") return true;

  return (
    user.role === "teacher" &&
    mcq.createdBy.toString() === user.userId
  );
};

// 1. Student: Chapter के Published MCQ प्राप्त करना
// सही उत्तर और Explanation इस API में नहीं भेजेंगे.
exports.getPublishedMCQs = async (req, res) => {
  try {
    const mcqs = await MCQ.find({
      chapterId: req.params.chapterId,
      isPublished: true
    })
      .select("question options language displayOrder")
      .sort({ displayOrder: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: mcqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Teacher/Admin: Manage MCQ List
exports.getManageMCQs = async (req, res) => {
  try {
    const filter = {};

    if (req.query.chapterId) {
      filter.chapterId = req.query.chapterId;
    }

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const mcqs = await MCQ.find(filter)
      .populate("chapterId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: mcqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Create MCQ
exports.createMCQ = async (req, res) => {
  try {
    const {
      chapterId,
      question,
      options,
      correctAnswer,
      explanation,
      language,
      displayOrder
    } = req.body;

    if (
      !chapterId ||
      !question ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some(
        option =>
          typeof option !== "string" ||
          !option.trim()
      ) ||
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer > 3
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question, Chapter, four options and valid correctAnswer (0-3) are required."
      });
    }

    const mcq = await MCQ.create({
      chapterId,
      question,
      options,
      correctAnswer,
      explanation,
      language,
      displayOrder,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: "MCQ created successfully",
      data: mcq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Update MCQ
exports.updateMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.mcqId);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found"
      });
    }

    if (!(await canManageMCQ(mcq, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
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

    res.status(200).json({
      success: true,
      message: "MCQ updated successfully",
      data: mcq
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Publish / Unpublish MCQ
exports.togglePublishMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.mcqId);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found"
      });
    }

    if (!(await canManageMCQ(mcq, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    mcq.isPublished = !mcq.isPublished;
    await mcq.save();

    res.status(200).json({
      success: true,
      message: mcq.isPublished
        ? "MCQ published successfully"
        : "MCQ unpublished successfully",
      data: mcq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 6. Delete MCQ
exports.deleteMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findById(req.params.mcqId);

    if (!mcq) {
      return res.status(404).json({
        success: false,
        message: "MCQ not found"
      });
    }

    if (!(await canManageMCQ(mcq, req.user))) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    await mcq.deleteOne();

    res.status(200).json({
      success: true,
      message: "MCQ deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 7. Student: Submit Quiz and Get Result
exports.submitQuiz = async (req, res) => {
  try {
    const { chapterId, answers } = req.body;

    if (
      !chapterId ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Chapter and answers are required."
      });
    }

    const submittedIds = answers.map(item => item.questionId);

    if (
      answers.some(
        item =>
          !item.questionId ||
          !Number.isInteger(item.selectedAnswer) ||
          item.selectedAnswer < 0 ||
          item.selectedAnswer > 3
      ) ||
      new Set(submittedIds).size !== submittedIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate answers."
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
      mcqs.map(mcq => [mcq._id.toString(), mcq])
    );

    let score = 0;

    const results = answers.map(item => {
      const mcq = mcqMap.get(item.questionId);
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

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        totalQuestions: mcqs.length,
        attempted: answers.length,
        correct: score,
        incorrect: answers.length - score,
        score,
        percentage: Number(
          ((score / mcqs.length) * 100).toFixed(2)
        ),
        results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
