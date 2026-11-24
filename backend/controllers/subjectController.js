const Subject = require("../models/Subject");

// GET: किसी Class के Subjects
const getSubjects = async (req, res) => {
  try {
    const { classId } = req.params;
    const { streamId } = req.query;

    const filter = {
      classId,
      isActive: true
    };

    // Class 11 और 12 के लिए Stream filter
    if (streamId) {
      filter.streamId = streamId;
    }

    const subjects = await Subject.find(filter)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getSubjects };
