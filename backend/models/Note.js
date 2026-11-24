const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

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

    language: {
      type: String,
      enum: ["Hindi", "English"],
      default: "Hindi"
    },

    content: {
      type: String,
      required: true
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

noteSchema.index({ chapterId: 1, isPublished: 1 });
noteSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
