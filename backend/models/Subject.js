const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      default: null
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    icon: {
      type: String,
      default: ""
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      default: null
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

subjectSchema.index(
  { name: 1, classId: 1, streamId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
