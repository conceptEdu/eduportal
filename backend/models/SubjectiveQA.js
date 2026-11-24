const mongoose = require("mongoose");

const subjectiveQASchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    question: {
      type: String,
      required: true,
      trim: true
    },

    answer: {
      type: String,
      required: true,
      trim: true
    },

    language: {
      type: String,
      enum: ["Hindi", "English"],
      default: "Hindi"
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

subjectiveQASchema.index({
  chapterId: 1,
  isPublished: 1
});

subjectiveQASchema.index({
  createdBy: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "SubjectiveQA",
  subjectiveQASchema
);
