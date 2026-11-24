const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const StudentAdmission = require("../models/StudentAdmission");

// ========================================
// 1. VERIFY ADMISSION NUMBER AND PIN
// ========================================

const verifyStudentAdmission = async (req, res) => {
  try {
    const { admissionNumber, registrationPIN, mobile } = req.body;

    if (!admissionNumber || !registrationPIN || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Admission Number, Registration PIN and Mobile are required"
      });
    }

    const cleanAdmissionNumber = admissionNumber.trim().toUpperCase();
    const cleanMobile = mobile.replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    const admission = await StudentAdmission.findOne({
      admissionNumber: cleanAdmissionNumber
    }).select("+registrationPinHash");

    if (!admission || !admission.isActive) {
      return res.status(404).json({
        success: false,
        message: "Invalid Admission Number or inactive admission"
      });
    }

    if (admission.isClaimed) {
      return res.status(409).json({
        success: false,
        message: "This admission is already registered"
      });
    }

    if (admission.lockedUntil && admission.lockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: "Too many failed attempts. Try again later."
      });
    }

    if (admission.pinExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration PIN has expired"
      });
    }

    const isPinCorrect = await bcrypt.compare(
      String(registrationPIN),
      admission.registrationPinHash
    );

    if (!isPinCorrect) {
      const failedAttempts = admission.failedAttempts + 1;

      admission.failedAttempts = failedAttempts;

      if (failedAttempts >= 5) {
        admission.lockedUntil = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );
      }

      await admission.save();

      return res.status(400).json({
        success: false,
        message:
          failedAttempts >= 5
            ? "Too many incorrect PIN attempts. Locked for 24 hours."
            : "Incorrect Registration PIN",
        remainingAttempts: Math.max(0, 5 - failedAttempts)
      });
    }

    // Check whether mobile is already registered
    const existingMobile = await User.findOne({
      mobile: cleanMobile
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "This mobile number is already registered"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admission verified. You can proceed with OTP verification.",
      student: {
        name: admission.studentName,
        admissionNumber: admission.admissionNumber,
        classId: admission.classId,
        streamId: admission.streamId
      }
    });

  } catch (error) {
    console.error("Student admission verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Student admission verification failed"
    });
  }
};


// ========================================
// 2. REGISTER STUDENT AFTER FIREBASE OTP
// ========================================

const registerStudent = async (req, res) => {
  let reservedAdmission = null;
  let createdUserId = null;

  try {
    const {
      admissionNumber,
      registrationPIN,
      mobile,
      password,
      firebaseIdToken
    } = req.body;

    if (
      !admissionNumber ||
      !registrationPIN ||
      !mobile ||
      !password ||
      !firebaseIdToken
    ) {
      return res.status(400).json({
        success: false,
        message: "All registration fields are required"
      });
    }

    const cleanAdmissionNumber = admissionNumber.trim().toUpperCase();
    const cleanMobile = mobile.replace(/\D/g, "");

    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number"
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });
    }

    // Verify Firebase ID Token on backend
    const { auth } = require("../config/firebaseAdmin");
const decodedToken = await auth.verifyIdToken(firebaseIdToken);


    if (!decodedToken.phone_number) {
      return res.status(401).json({
        success: false,
        message: "Firebase phone verification is missing"
      });
    }

    const verifiedMobile = decodedToken.phone_number.replace(/\D/g, "");

    if (verifiedMobile.slice(-10) !== cleanMobile) {
      return res.status(401).json({
        success: false,
        message: "Verified mobile number does not match"
      });
    }

    // Find admission record
    const admission = await StudentAdmission.findOne({
      admissionNumber: cleanAdmissionNumber
    }).select("+registrationPinHash");

    if (!admission || !admission.isActive || admission.isClaimed) {
      return res.status(400).json({
        success: false,
        message: "Invalid, inactive or already registered admission"
      });
    }

    if (admission.pinExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Registration PIN has expired"
      });
    }

    if (admission.lockedUntil && admission.lockedUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message: "Registration is temporarily locked"
      });
    }

    const isPinCorrect = await bcrypt.compare(
      String(registrationPIN),
      admission.registrationPinHash
    );

    if (!isPinCorrect) {
      admission.failedAttempts += 1;

      if (admission.failedAttempts >= 5) {
        admission.lockedUntil = new Date(
          Date.now() + 24 * 60 * 60 * 1000
        );
      }

      await admission.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect Registration PIN"
      });
    }

    // Check existing account
    const existingUser = await User.findOne({
      $or: [
        { admissionNumber: cleanAdmissionNumber },
        { mobile: cleanMobile }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Admission Number or Mobile Number is already registered"
      });
    }

    // Create user ID before claiming admission
    const userId = new mongoose.Types.ObjectId();

    const hashedPassword = await bcrypt.hash(
      String(password),
      12
    );

    // Atomically reserve admission
    reservedAdmission = await StudentAdmission.findOneAndUpdate(
      {
        _id: admission._id,
        isActive: true,
        isClaimed: false,
        pinExpiresAt: { $gt: new Date() },
        $or: [
          { lockedUntil: null },
          { lockedUntil: { $lte: new Date() } }
        ]
      },
      {
        $set: {
          isClaimed: true,
          claimedBy: userId,
          failedAttempts: 0,
          lockedUntil: null
        }
      },
      { new: true }
    );

    if (!reservedAdmission) {
      return res.status(409).json({
        success: false,
        message: "Admission is already claimed or unavailable"
      });
    }

    // Create student account
    const student = new User({
      _id: userId,
      name: admission.studentName,
      admissionNumber: admission.admissionNumber,
      mobile: cleanMobile,
      password: hashedPassword,
      role: "student",
      classId: admission.classId,
      streamId: admission.streamId,
      isActive: true
    });

    await student.save();

    createdUserId = student._id;

    const token = jwt.sign(
      {
        userId: student._id,
        role: student.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Student registration successful",
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
    console.error("Student registration error:", error);

    // Rollback if account creation failed after admission reservation
    if (reservedAdmission && !createdUserId) {
      try {
        await StudentAdmission.updateOne(
          {
            _id: reservedAdmission._id,
            claimedBy: reservedAdmission.claimedBy
          },
          {
            $set: {
              isClaimed: false,
              claimedBy: null
            }
          }
        );
      } catch (rollbackError) {
        console.error("Admission rollback error:", rollbackError);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Admission Number, Email or Mobile Number already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Student registration failed"
    });
  }
};


module.exports = {
  verifyStudentAdmission,
  registerStudent
};
