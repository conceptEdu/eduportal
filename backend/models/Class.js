const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    classNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 12
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    hasStreams: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
