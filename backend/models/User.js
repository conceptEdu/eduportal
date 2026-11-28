const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: function () {
        return this.role !== "student";
      },
      lowercase: true,
      trim: true
    },

    admissionNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true
    },

    mobile: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10}$/,
        "Enter a valid 10-digit mobile number"
      ]
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student"
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null
    },
    sectionId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Section",
  default: null
   },

    streamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Email: Unique only when email is a string
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: "string" }
    }
  }
);

// Mobile: Unique only when mobile is a string
userSchema.index(
  { mobile: 1 },
  {
    unique: true,
    partialFilterExpression: {
      mobile: { $type: "string" }
    }
  }
);

// Student, Teacher and Admin search index
userSchema.index({
  role: 1,
  classId: 1,
  streamId: 1
});

module.exports = mongoose.model("User", userSchema);
