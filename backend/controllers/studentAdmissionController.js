const StudentAdmission = require("../models/StudentAdmission");
const Class = require("../models/Class");
const Stream = require("../models/Stream");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Create single student admission
const createStudentAdmission = async (req, res) => {
  try {
    const {
      admissionNumber,
      studentName,
      classId,
      streamId
    } = req.body;

    // 1. Validate required fields
    if (
      !admissionNumber ||
      !studentName ||
      !classId
    ) {
      return res.status(400).json({
        success: false,
        message: "Admission Number, Student Name and Class are required"
      });
    }

    const normalizedAdmissionNumber =
      admissionNumber.trim().toUpperCase();

    if (studentName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Student name must have at least 2 characters"
      });
    }

    // 2. Check active class
    const selectedClass = await Class.findOne({
      _id: classId,
      isActive: true
    });

    if (!selectedClass) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive class"
      });
    }

    // 3. Validate stream
    let selectedStream = null;

    if (selectedClass.hasStreams) {
      if (!streamId) {
        return res.status(400).json({
          success: false,
          message: "Stream is required for this class"
        });
      }

      selectedStream = await Stream.findOne({
        _id: streamId,
        classId: selectedClass._id,
        isActive: true
      });

      if (!selectedStream) {
        return res.status(400).json({
          success: false,
          message: "Invalid stream for selected class"
        });
      }
    } else if (streamId) {
      return res.status(400).json({
        success: false,
        message: "Stream is not applicable for this class"
      });
    }

    // 4. Check duplicate admission number
    const existingAdmission = await StudentAdmission.findOne({
      admissionNumber: normalizedAdmissionNumber
    });

    if (existingAdmission) {
      return res.status(409).json({
        success: false,
        message: "Admission Number already exists"
      });
    }

    // 5. Generate secure random PIN
    const registrationPIN = crypto
      .randomInt(100000, 1000000)
      .toString();

    const registrationPinHash = await bcrypt.hash(
      registrationPIN,
      12
    );

    // 6. PIN validity: 24 hours
    const pinExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    // 7. Create admission record
    const admission = await StudentAdmission.create({
      admissionNumber: normalizedAdmissionNumber,
      studentName: studentName.trim(),
      classId: selectedClass._id,
      streamId: selectedStream?._id || null,
      registrationPinHash,
      pinExpiresAt,
      createdBy: req.user.userId
    });

    // 8. Return PIN only once to authorized creator
    return res.status(201).json({
      success: true,
      message: "Student admission created successfully",
      data: {
        id: admission._id,
        admissionNumber: admission.admissionNumber,
        studentName: admission.studentName,
        class: selectedClass.name,
        stream: selectedStream?.name || null,
        registrationPIN,
        pinExpiresAt: admission.pinExpiresAt
      }
    });

  } catch (error) {
    console.error(
      "Create Student Admission Error:",
      error.message
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Admission Number already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create student admission"
    });
  }
};

const xlsx = require("xlsx");
const { google } = require("googleapis");


// Google Sheet URL से Spreadsheet ID निकालना
const getSpreadsheetId = (url) => {
  if (typeof url !== "string") {
    throw new Error("Google Sheets URL is required");
  }

  const match = url.match(
    /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/
  );

  if (!match) {
    throw new Error("Invalid Google Sheets URL");
  }

  return match[1];
};

// Excel / CSV Buffer पढ़ना
const readUploadedFile = (buffer) => {
  const workbook = xlsx.read(buffer, {
    type: "buffer",
    cellDates: false
  });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!firstSheet) {
    throw new Error("File does not contain a worksheet");
  }

  return xlsx.utils.sheet_to_json(firstSheet, {
    defval: "",
    raw: false
  });
};

// Google Sheets से Rows पढ़ना
const readGoogleSheet = async (url, accessType, range = "Sheet1!A:D") => {
  const spreadsheetId = getSpreadsheetId(url);

  let auth;

  if (accessType === "public") {
    if (!process.env.GOOGLE_SHEETS_API_KEY) {
      throw new Error("Google Sheets API key is not configured");
    }

    auth = process.env.GOOGLE_SHEETS_API_KEY;
  } else if (accessType === "private") {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
      throw new Error("Service Account file is not configured");
    }

    const serviceAuth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly"
      ]
    });

    auth = await serviceAuth.getClient();
  } else {
    throw new Error("Invalid Google Sheets access type");
  }

  const sheets = google.sheets({
    version: "v4",
    auth
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range
  });

  const values = response.data.values || [];

  if (values.length < 2) {
    return [];
  }

  const headers = values[0].map((h) =>
    String(h).trim()
  );

  return values.slice(1).map((row) => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });

    return item;
  });
};

// Common Import Function
const importStudentRows = async (rows, req, res) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No student records found"
    });
  }

  if (rows.length > 1500) {
    return res.status(400).json({
      success: false,
      message: "Maximum 1500 records allowed per import"
    });
  }

  const results = [];
  const seenAdmissionNumbers = new Set();

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rowNumber = index + 2;

    try {
      const admissionNumber = String(
        row.AdmissionNumber || ""
      ).trim().toUpperCase();

      const studentName = String(
        row.StudentName || ""
      ).trim();

      const classValue = String(
        row.Class || ""
      ).trim();

      const streamValue = String(
        row.Stream || ""
      ).trim();

      if (!admissionNumber || !studentName || !classValue) {
        throw new Error(
          "AdmissionNumber, StudentName and Class are required"
        );
      }

      if (studentName.length < 2 || studentName.length > 100) {
        throw new Error("Invalid student name");
      }

      if (seenAdmissionNumbers.has(admissionNumber)) {
        throw new Error("Duplicate Admission Number in uploaded data");
      }

      seenAdmissionNumbers.add(admissionNumber);

      const existing = await StudentAdmission.findOne({
        admissionNumber
      });

      if (existing) {
        throw new Error("Admission Number already exists");
      }

      const classNumber = Number(
        classValue.replace(/^class\s*/i, "")
      );

      if (
        !Number.isInteger(classNumber) ||
        classNumber < 1 ||
        classNumber > 12
      ) {
        throw new Error("Invalid Class");
      }

      const selectedClass = await Class.findOne({
        classNumber,
        isActive: true
      });

      if (!selectedClass) {
        throw new Error("Class not found or inactive");
      }

      let selectedStream = null;

      if (selectedClass.hasStreams) {
        if (!streamValue) {
          throw new Error("Stream is required for this class");
        }

        selectedStream = await Stream.findOne({
          name: new RegExp(
            `^${streamValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
          classId: selectedClass._id,
          isActive: true
        });

        if (!selectedStream) {
          throw new Error("Invalid Stream for selected class");
        }
      } else if (streamValue) {
        throw new Error("Stream is not applicable for this class");
      }

      const registrationPIN = crypto
        .randomInt(100000, 1000000)
        .toString();

      const registrationPinHash = await bcrypt.hash(
        registrationPIN,
        12
      );

      const admission = await StudentAdmission.create({
        admissionNumber,
        studentName,
        classId: selectedClass._id,
        streamId: selectedStream?._id || null,
        registrationPinHash,
        pinExpiresAt: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
        createdBy: req.user.userId
      });

      results.push({
        row: rowNumber,
        status: "success",
        admissionNumber,
        studentName,
        registrationPIN
      });

    } catch (error) {
      results.push({
        row: rowNumber,
        status: "failed",
        admissionNumber: String(
          row.AdmissionNumber || ""
        ),
        message: error.message
      });
    }
  }

  const successful = results.filter(
    (item) => item.status === "success"
  ).length;

  return res.status(200).json({
    success: true,
    message: "Bulk import processing completed",
    summary: {
      total: rows.length,
      successful,
      failed: rows.length - successful
    },
    results
  });
};

// Excel / CSV Import
const importStudentAdmissionsFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel or CSV file"
      });
    }

    const rows = readUploadedFile(req.file.buffer);

    return await importStudentRows(rows, req, res);

  } catch (error) {
    console.error("File Import Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Google Sheets Import
const importStudentAdmissionsSheet = async (req, res) => {
  try {
    const { url, accessType, range } = req.body;

    if (!url || !accessType) {
      return res.status(400).json({
        success: false,
        message: "Google Sheet URL and accessType are required"
      });
    }

    const rows = await readGoogleSheet(
      url,
      accessType,
      range || "Sheet1!A:D"
    );

    return await importStudentRows(rows, req, res);

  } catch (error) {
    console.error("Google Sheet Import Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Copy-Paste Bulk Import
const importStudentAdmissionsPaste = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please paste student data"
      });
    }

    // Tab-separated data from Excel / Google Sheets
    const lines = text
      .trim()
      .split(/\r?\n/)
      .filter(line => line.trim() !== "");

    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Header and at least one student record are required"
      });
    }

    // Read header row
    const headers = lines[0]
      .split("\t")
      .map(header =>
        header.trim().toLowerCase().replace(/[\s_]/g, "")
      );

    const requiredHeaders = [
      "admissionnumber",
      "studentname",
      "class"
    ];

    const missingHeaders = requiredHeaders.filter(
      header => !headers.includes(header)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required columns: AdmissionNumber, StudentName, Class"
      });
    }

    // Convert pasted rows into objects
    const rows = lines.slice(1).map(line => {
      const values = line.split("\t");
      const item = {};

      headers.forEach((header, index) => {
        item[header] = (values[index] || "").trim();
      });

      return {
        AdmissionNumber: item.admissionnumber || "",
        StudentName: item.studentname || "",
        Class: item.class || "",
        Stream: item.stream || ""
      };
    });

    return await importStudentRows(rows, req, res);

  } catch (error) {
    console.error("Paste Import Error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createStudentAdmission,
  importStudentAdmissionsFile,
  importStudentAdmissionsSheet,
  importStudentAdmissionsPaste
};
