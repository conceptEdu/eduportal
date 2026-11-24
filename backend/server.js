const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const subjectiveQARoutes = require("./routes/subjectiveQARoutes");
const videoRoutes = require("./routes/videoRoutes");
const mcqRoutes = require("./routes/mcqRoutes");



const connectDB = require("./config/db");

dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Import Routes
const classRoutes = require("./routes/classRoutes");
const streamRoutes = require("./routes/streamRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const quizRoutes = require("./routes/quizRoutes");

// Home API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EduPortal MERN Backend Running!",
    version: "1.0.0"
  });
});

// Health API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "EduPortal API is healthy"
  });
});

// API Routes
app.use("/api/classes", classRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/subjective-qa", subjectiveQARoutes);
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/mcq", mcqRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found"
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT,"0.0.0.0", () => {
      console.log(`EduPortal Server: http://localhost:${PORT}`);
    }); 


  } catch (error) {
    console.error("Server Error:", error.message);
    process.exit(1);
  }
};

startServer();
