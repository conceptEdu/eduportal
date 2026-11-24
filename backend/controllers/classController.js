const Class = require("../models/Class");

// GET /api/classes
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .sort({ classNumber: 1 })
      .select("classNumber name hasStreams");

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Classes प्राप्त नहीं हो सकीं",
      error: error.message
    });
  }
};

module.exports = { getClasses };
