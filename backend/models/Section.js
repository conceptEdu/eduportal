
const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 10
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// एक Class में Section का नाम Unique रहेगा
sectionSchema.index(
  { name: 1, classId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Section",
  sectionSchema
);
