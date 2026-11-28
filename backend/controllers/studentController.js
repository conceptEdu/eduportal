
const User = require("../models/User");
const StudentAdmission = require("../models/StudentAdmission");
const TeacherAssignment = require("../models/TeacherAssignment");

// Escape special characters in search text
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Fetch and combine Registered + Pending students
const fetchCombinedStudents = async (userFilter, admissionFilter, page, limit) => {
  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 50));

  const [registeredStudents, pendingStudents] = await Promise.all([
    User.find(userFilter)
      .select("name admissionNumber mobile classId sectionId streamId")
      .populate("classId", "name classNumber")
      .populate("sectionId", "name")
      .populate("streamId", "name")
      .lean(),

    StudentAdmission.find(admissionFilter)
      .select("admissionNumber studentName classId sectionId streamId isClaimed")
      .populate("classId", "name classNumber")
      .populate("sectionId", "name")
      .populate("streamId", "name")
      .lean()
  ]);

  // Registered students
  const combined = registeredStudents.map((student) => ({
    _id: student._id,
    name: student.name,
    admissionNumber: student.admissionNumber,
    mobile: student.mobile || "",
    classId: student.classId,
    sectionId: student.sectionId,
    streamId: student.streamId,
    registrationStatus: "Registered"
  }));

  // Store registered admission numbers to prevent duplicates
  const registeredNumbers = new Set(
    registeredStudents
      .map((student) =>
        String(student.admissionNumber || "").trim().toUpperCase()
      )
      .filter(Boolean)
  );

  // Add only unclaimed admissions that are not already registered
  for (const admission of pendingStudents) {
    const admissionNumber = String(
      admission.admissionNumber || ""
    ).trim().toUpperCase();

    if (
      admission.isClaimed === false &&
      !registeredNumbers.has(admissionNumber)
    ) {
      combined.push({
        _id: admission._id,
        name: admission.studentName,
        admissionNumber: admission.admissionNumber,
        mobile: "",
        classId: admission.classId,
        sectionId: admission.sectionId,
        streamId: admission.streamId,
        registrationStatus: "Pending"
      });

      registeredNumbers.add(admissionNumber);
    }
  }

  // Sort by student name
  combined.sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  const total = combined.length;

  // Apply pagination after combining both collections
  const startIndex = (pageNumber - 1) * pageSize;
  const data = combined.slice(startIndex, startIndex + pageSize);

  return {
    total,
    page: pageNumber,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
    data
  };
};


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

    const userFilter = {
      role: "student",
      isActive: true
    };

    const admissionFilter = {
      isActive: true,
      isClaimed: false
    };

    if (classId) {
      userFilter.classId = classId;
      admissionFilter.classId = classId;
    }

    if (sectionId) {
      userFilter.sectionId = sectionId;
      admissionFilter.sectionId = sectionId;
    }

    if (streamId) {
      userFilter.streamId = streamId;
      admissionFilter.streamId = streamId;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      const searchCondition = {
        $or: [
          { name: searchRegex },
          { admissionNumber: searchRegex }
        ]
      };

      userFilter.$and = [searchCondition];

      admissionFilter.$or = [
        { studentName: searchRegex },
        { admissionNumber: searchRegex }
      ];
    }

    const result = await fetchCombinedStudents(
      userFilter,
      admissionFilter,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Student list fetched successfully",
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      data: result.data
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
    }).select("classId sectionId").lean();

    if (!assignments.length) {
      return res.status(200).json({
        success: true,
        message: "No class or section assigned",
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        },
        data: []
      });
    }

    const assignedSections = assignments.map((item) => ({
      classId: item.classId,
      sectionId: item.sectionId
    }));

    const {
      search,
      page = 1,
      limit = 50
    } = req.query;

    const userFilter = {
      role: "student",
      isActive: true,
      $or: assignedSections
    };

    const admissionFilter = {
      isActive: true,
      isClaimed: false,
      $or: assignedSections
    };

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), "i");

      userFilter.$and = [{
        $or: [
          { name: searchRegex },
          { admissionNumber: searchRegex }
        ]
      }];

      admissionFilter.$and = [{
        $or: [
          { studentName: searchRegex },
          { admissionNumber: searchRegex }
        ]
      }];
    }

    const result = await fetchCombinedStudents(
      userFilter,
      admissionFilter,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Assigned class students fetched successfully",
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      data: result.data
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
