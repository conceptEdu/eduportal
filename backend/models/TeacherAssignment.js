
const mongoose = require("mongoose");

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// एक Teacher को एक Section दोबारा Assign नहीं होगा
teacherAssignmentSchema.index(
  { teacherId: 1, classId: 1, sectionId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "TeacherAssignment",
  teacherAssignmentSchema
);
