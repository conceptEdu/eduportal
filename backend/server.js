require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Database Connection
const connectDB = require("./config/db");

// Import Routes
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const subjectiveQARoutes = require("./routes/subjectiveQARoutes");
const videoRoutes = require("./routes/videoRoutes");
const mcqRoutes = require("./routes/mcqRoutes");

const classRoutes = require("./routes/classRoutes");
const streamRoutes = require("./routes/streamRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const quizRoutes = require("./routes/quizRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(cors());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Home API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduPortal MERN Backend Running!",
    version: "1.0.0"
  });
});

// Health API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduPortal API is healthy",
    database: "Connection status managed by server"
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
    message: "API Route Not Found",
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Application Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// Server Configuration
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `EduPortal Server running on port ${PORT}`
      );
      console.log("MongoDB connection initialized");
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("Server Startup Error:", error.message);
      process.exit(1);
    });

  } catch (error) {
    console.error("Database Connection Error:", error.message);
    process.exit(1);
  }
};

startServer();
