const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
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

    options: {
      type: [
        {
          type: String,
          required: true,
          trim: true
        }
      ],
      validate: {
        validator: function (value) {
          return value.length === 4 &&
            value.every(option => option.length > 0);
        },
        message: "Exactly 4 non-empty options are required."
      }
    },

    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },

    explanation: {
      type: String,
      trim: true,
      default: ""
    },

    language: {
      type: String,
      enum: ["Hindi", "English"],
      default: "Hindi"
    },

    displayOrder: {
      type: Number,
      default: 1,
      min: 1
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

mcqSchema.index({
  chapterId: 1,
  isPublished: 1,
  displayOrder: 1
});

mcqSchema.index({
  createdBy: 1,
  createdAt: -1
});

module.exports = mongoose.model("MCQ", mcqSchema);
