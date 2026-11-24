const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    youtubeUrl: {
      type: String,
      required: true,
      trim: true
    },

    youtubeVideoId: {
      type: String,
      required: true,
      trim: true
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
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
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

videoSchema.index({ chapterId: 1, isPublished: 1, displayOrder: 1 });
videoSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("Video", videoSchema);
