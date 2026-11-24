const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    question: {
      type: String,
      required: true,
      trim: true
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return (
            value.length === 4 &&
            value.every(option => option.trim().length > 0)
          );
        },
        message: "हर MCQ में ठीक 4 खाली न होने वाले विकल्प होने चाहिए।"
      }
    },

    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    },

    explanation: {
      type: String,
      default: ""
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

questionSchema.index({ chapterId: 1, isPublished: 1 });

module.exports = mongoose.model("Question", questionSchema);
