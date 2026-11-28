
const User = require("../models/User");
const TeacherAssignment = require("../models/TeacherAssignment");

// =====================================
// 1. GET ALL STUDENTS
// Admin and Teacher
// =====================================

const getAllStudents = async (req, res) => {
  try {
    const {
      classId,
      sectionId,
      streamId,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {
      role: "student",
      isActive: true
    };

    if (classId) filter.classId = classId;
    if (sectionId) filter.sectionId = sectionId;
    if (streamId) filter.streamId = streamId;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        {
          admissionNumber: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(limit) || 50)
    );

    const total = await User.countDocuments(filter);

    const students = await User.find(filter)
      .select("name admissionNumber mobile classId sectionId streamId")
      .populate("classId", "name classNumber")
      .populate("sectionId", "name")
      .populate("streamId", "name")
      .sort({ name: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Student list fetched successfully",
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      data: students
    });

  } catch (error) {
    console.error("Get All Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student list"
    });
  }
};


// =====================================
// 2. GET STUDENTS OF ASSIGNED CLASSES
// Teacher only
// =====================================

const getMyClassStudents = async (req, res) => {
  try {
    const assignments = await TeacherAssignment.find({
      teacherId: req.user.userId,
      isActive: true
    }).select("classId sectionId");

    if (!assignments.length) {
      return res.status(200).json({
        success: true,
        message: "No class or section assigned",
        count: 0,
        data: []
      });
    }

    const assignedSections = assignments.map(item => ({
      classId: item.classId,
      sectionId: item.sectionId
    }));

    const {
      search,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {
      role: "student",
      isActive: true,
      $or: assignedSections
    };

    if (search) {
      filter.$and = [{
        $or: [
          { name: { $regex: search, $options: "i" } },
          {
            admissionNumber: {
              $regex: search,
              $options: "i"
            }
          }
        ]
      }];
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(limit) || 50)
    );

    const total = await User.countDocuments(filter);

    const students = await User.find(filter)
      .select("name admissionNumber mobile classId sectionId streamId")
      .populate("classId", "name classNumber")
      .populate("sectionId", "name")
      .populate("streamId", "name")
      .sort({ name: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Assigned class students fetched successfully",
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize)
      },
      data: students
    });

  } catch (error) {
    console.error("Get My Class Students Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch assigned students"
    });
  }
};


module.exports = {
  getAllStudents,
  getMyClassStudents
};
