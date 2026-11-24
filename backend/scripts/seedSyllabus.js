const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Class = require("../models/Class");
const Stream = require("../models/Stream");
const Subject = require("../models/Subject");
const Chapter = require("../models/Chapter");

const syllabus = require("../data/syllabus.json");

const seedSyllabus = async () => {
  try {
    await connectDB();

    if (!Array.isArray(syllabus) || syllabus.length === 0) {
      throw new Error("Syllabus JSON खाली है या गलत Format में है");
    }

    let subjectCount = 0;
    let chapterCount = 0;

    for (const classData of syllabus) {
      const { classNumber, subjects, streams } = classData;

      if (!Number.isInteger(classNumber) ||
          classNumber < 1 ||
          classNumber > 12) {
        throw new Error("Invalid classNumber");
      }

      const selectedClass = await Class.findOne({
        classNumber,
        isActive: true
      });

      if (!selectedClass) {
        throw new Error(`Class ${classNumber} Database में नहीं मिली`);
      }

      // Class 11 और 12
      if (selectedClass.hasStreams) {
        if (!Array.isArray(streams)) {
          throw new Error(
            `Class ${classNumber} के लिए streams Array जरूरी है`
          );
        }

        for (const streamData of streams) {
          const selectedStream = await Stream.findOne({
            name: streamData.name,
            classId: selectedClass._id,
            isActive: true
          });

          if (!selectedStream) {
            throw new Error(
              `Class ${classNumber}: ${streamData.name} Stream नहीं मिली`
            );
          }

          await saveSubjects(
            streamData.subjects,
            selectedClass,
            selectedStream
          );
        }
      }

      // Class 1 से 10
      else {
        if (!Array.isArray(subjects)) {
          throw new Error(
            `Class ${classNumber} के लिए subjects Array जरूरी है`
          );
        }

        await saveSubjects(
          subjects,
          selectedClass,
          null
        );
      }
    }

    async function saveSubjects(
      subjects,
      selectedClass,
      selectedStream
    ) {
      if (!Array.isArray(subjects)) {
        throw new Error("Subjects Array सही नहीं है");
      }

      for (const subjectData of subjects) {
        if (
          !subjectData.name ||
          !Array.isArray(subjectData.chapters)
        ) {
          throw new Error("Subject या Chapters का Data गलत है");
        }

        const subject = await Subject.findOneAndUpdate(
          {
            name: subjectData.name,
            classId: selectedClass._id,
            streamId: selectedStream
              ? selectedStream._id
              : null
          },
          {
  $set: {
    key: subjectData.key || null,
    name: subjectData.name,
    icon: subjectData.icon || "",
    classId: selectedClass._id,
    streamId: selectedStream
      ? selectedStream._id
      : null,
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

        subjectCount++;

        for (const chapterData of subjectData.chapters) {
          if (
            !chapterData.title ||
            !Number.isInteger(chapterData.chapterNumber) ||
            chapterData.chapterNumber < 1
          ) {
            throw new Error(
              `Invalid Chapter in Subject: ${subjectData.name}`
            );
          }

          await Chapter.findOneAndUpdate(
            {
              subjectId: subject._id,
              chapterNumber: chapterData.chapterNumber
            },
            {
  $set: {
    title: chapterData.title,
    chapterNumber: chapterData.chapterNumber,
    book: chapterData.book || null,
    subjectId: subject._id,
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

          chapterCount++;
        }
      }
    }

    console.log("--------------------------------");
    console.log("EduPortal Syllabus Import Complete");
    console.log("Subjects Processed:", subjectCount);
    console.log("Chapters Processed:", chapterCount);
    console.log("--------------------------------");

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("Syllabus Import Error:", error.message);

    await mongoose.disconnect();
    process.exit(1);
  }
};

seedSyllabus();
