const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured"
      });
    }

    // Find active Teacher or Admin
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      role: { $in: ["teacher", "admin"] },
      isActive: true
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Teacher Login Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must have at least 2 characters"
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Password must have at least 12 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const teacher = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "teacher",
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      data: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      }
    });

  } catch (error) {
    console.error("Create Teacher Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create teacher"
    });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and password are required"
      });
    }

    const cleanMobile = String(mobile).replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured"
      });
    }

    // Find active Student
    const student = await User.findOne({
      mobile: cleanMobile,
      role: "student",
      isActive: true
    }).select("+password");

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      String(password),
      student.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: student._id.toString(),
        role: student.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Student login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        mobile: student.mobile,
        role: student.role,
        classId: student.classId,
        streamId: student.streamId
      }
    });

  } catch (error) {
    console.error("Student Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during student login"
    });
  }
};


module.exports = {
  loginTeacher,
  createTeacher,
  loginStudent
};

