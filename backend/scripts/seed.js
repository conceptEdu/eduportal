const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const Class = require("../models/Class");
const Stream = require("../models/Stream");

const seedDatabase = async () => {
  try {
    // 1. MongoDB Connect
    await connectDB();

    console.log("Starting EduPortal Seed...");

    // 2. Class 1 to 12
    const classDocuments = [];

    for (let number = 1; number <= 12; number++) {
      const classData = await Class.findOneAndUpdate(
        { classNumber: number },
        {
          $set: {
            classNumber: number,
            name: `Class ${number}`,
            hasStreams: number === 11 || number === 12,
            isActive: true
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );

      classDocuments.push(classData);

      console.log(`Class ${number} saved`);
    }

    // 3. Streams for Class 11 and 12
    const streamNames = [
      "Arts",
      "Science",
      "Commerce"
    ];

    for (const classNumber of [11, 12]) {
      const selectedClass = classDocuments.find(
        item => item.classNumber === classNumber
      );

      for (const streamName of streamNames) {
        await Stream.findOneAndUpdate(
          {
            name: streamName,
            classId: selectedClass._id
          },
          {
            $set: {
              name: streamName,
              classId: selectedClass._id,
              isActive: true
            }
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
          }
        );

        console.log(
          `Class ${classNumber} - ${streamName} saved`
        );
      }
    }

    console.log("--------------------------------");
    console.log("EduPortal Seed Completed!");
    console.log("Total Classes: 12");
    console.log("Total Streams: 6");
    console.log("--------------------------------");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Seed Error:", error.message);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
