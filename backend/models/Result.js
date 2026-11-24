const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    selectedOption: {
      type: Number,
      min: -1,
      max: 3,
      default: -1
    },

    isCorrect: {
      type: Boolean,
      required: true
    }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    answers: {
      type: [answerSchema],
      default: []
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 0
    },

    correctAnswers: {
      type: Number,
      required: true,
      min: 0
    },

    wrongAnswers: {
      type: Number,
      required: true,
      min: 0
    },

    unanswered: {
      type: Number,
      required: true,
      min: 0
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    timeTakenSeconds: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

resultSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model("Result", resultSchema);
