const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    chapterNumber: {
      type: Number,
      required: true,
      min: 1
    },

    book: {
      type: String,
      default: null
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

chapterSchema.index(
  { subjectId: 1, chapterNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Chapter", chapterSchema);
