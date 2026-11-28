
const TeacherAssignment = require("../models/TeacherAssignment");
const User = require("../models/User");
const Class = require("../models/Class");
const Section = require("../models/Section");

// =====================================
// 1. CREATE TEACHER ASSIGNMENT
// =====================================

const createTeacherAssignment = async (req, res) => {
  try {
    const { teacherId, classId, sectionId } = req.body;

    if (!teacherId || !classId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Teacher, Class and Section are required"
      });
    }

    // Verify Teacher
    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      isActive: true
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Active teacher not found"
      });
    }

    // Verify Class
    const selectedClass = await Class.findOne({
      _id: classId,
      isActive: true
    });

    if (!selectedClass) {
      return res.status(404).json({
        success: false,
        message: "Active class not found"
      });
    }

    // Verify Section belongs to selected Class
    const selectedSection = await Section.findOne({
      _id: sectionId,
      classId: selectedClass._id,
      isActive: true
    });

    if (!selectedSection) {
      return res.status(400).json({
        success: false,
        message: "Invalid section for selected class"
      });
    }

    // Check duplicate assignment
    const existing = await TeacherAssignment.findOne({
      teacherId,
      classId,
      sectionId
    });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          message: "This assignment already exists"
        });
      }

      // Reactivate previous assignment
      existing.isActive = true;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Previous assignment reactivated",
        data: existing
      });
    }

    // Create assignment
    const assignment = await TeacherAssignment.create({
      teacherId,
      classId,
      sectionId,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: "Teacher assigned successfully",
      data: assignment
    });

  } catch (error) {
    console.error("Teacher Assignment Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Assignment already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to assign teacher"
    });
  }
};


// =====================================
// 2. GET ALL TEACHER ASSIGNMENTS
// =====================================

const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await TeacherAssignment.find()
      .populate("teacherId", "name email role")
      .populate("classId", "name classNumber")
      .populate("sectionId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });

  } catch (error) {
    console.error("Get Teacher Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch teacher assignments"
    });
  }
};


// =====================================
// 3. DEACTIVATE TEACHER ASSIGNMENT
// =====================================

const deactivateTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await TeacherAssignment.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Teacher assignment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher assignment deactivated",
      data: assignment
    });

  } catch (error) {
    console.error("Deactivate Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate assignment"
    });
  }
};


module.exports = {
  createTeacherAssignment,
  getTeacherAssignments,
  deactivateTeacherAssignment
};
