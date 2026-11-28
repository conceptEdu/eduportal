
const Section = require("../models/Section");
const Class = require("../models/Class");

// =====================================
// 1. CREATE SECTION
// =====================================

const createSection = async (req, res) => {
  try {
    const { name, classId } = req.body;

    if (!name || !classId) {
      return res.status(400).json({
        success: false,
        message: "Section name and Class are required"
      });
    }

    const normalizedName = String(name)
      .trim()
      .toUpperCase();

    if (!/^[A-Z0-9]{1,10}$/.test(normalizedName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section name"
      });
    }

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

    const existing = await Section.findOne({
      name: normalizedName,
      classId
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Section already exists in this class"
      });
    }

    const section = await Section.create({
      name: normalizedName,
      classId,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: section
    });

  } catch (error) {
    console.error("Create Section Error:", error);

    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000
        ? "Section already exists"
        : "Unable to create section"
    });
  }
};


// =====================================
// 2. GET SECTIONS
// =====================================

const getSections = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.classId) {
      filter.classId = req.query.classId;
    }

    const sections = await Section.find(filter)
      .populate("classId", "name classNumber")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });

  } catch (error) {
    console.error("Get Sections Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch sections"
    });
  }
};


// =====================================
// 3. DEACTIVATE SECTION
// =====================================

const deactivateSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section deactivated successfully",
      data: section
    });

  } catch (error) {
    console.error("Deactivate Section Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate section"
    });
  }
};


module.exports = {
  createSection,
  getSections,
  deactivateSection
};
