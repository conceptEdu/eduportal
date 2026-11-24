const mongoose = require("mongoose");

const studentAdmissionSchema = new mongoose.Schema(
  {
    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
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

    registrationPinHash: {
      type: String,
      required: true,
      select: false
    },

    pinExpiresAt: {
      type: Date,
      required: true
    },

    failedAttempts: {
      type: Number,
      default: 0
    },

    lockedUntil: {
      type: Date,
      default: null
    },

    isClaimed: {
      type: Boolean,
      default: false
    },

    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

studentAdmissionSchema.index({
  admissionNumber: 1,
  isActive: 1
});

module.exports = mongoose.model(
  "StudentAdmission",
  studentAdmissionSchema
);
