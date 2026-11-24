const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Arts", "Science", "Commerce"]
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

streamSchema.index(
  { name: 1, classId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Stream", streamSchema);
