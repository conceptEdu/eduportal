const Stream = require("../models/Stream");

const getStreams = async (req, res) => {
  try {
    const { classId } = req.params;

    const streams = await Stream.find({
      classId: classId,
      isActive: true
    });

    res.status(200).json({
      success: true,
      count: streams.length,
      data: streams
    });

  } catch (error) {
    console.error("Stream Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getStreams };
