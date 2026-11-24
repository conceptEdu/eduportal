const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

// Tumhara Student Model - isko apne model se match karna
const Student = require("./models/Student");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected");

  const students = [];

  fs.createReadStream("students.csv")
    .pipe(csv())
    .on("data", (row) => {
      // YAHAN DHYAN DO: Sheet ke column ka naam yahan likhna hai
      students.push({
        name: row.Name,
        email: row.Email,
        className: row.Class,
        rollNo: row.RollNo,
        phone: row.Phone,
      });
    })
    .on("end", async () => {
      await Student.insertMany(students);
      console.log(`${students.length} Students daal diye!`);
      process.exit();
    });
});
