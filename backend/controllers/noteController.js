const mongoose = require("mongoose");
const Note = require("../models/Note");
const Chapter = require("../models/Chapter");

// GET Published Notes by Chapter (Student API)
const getNotesByChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chapter ID"
      });
    }

    const notes = await Note.find({
      chapterId,
      isPublished: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });

  } catch (error) {
    console.error("Notes Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch notes"
    });
  }
};


// GET Notes for Teacher Dashboard
const getManageNotes = async (req, res) => {
  try {
    const filter =
      req.user.role === "admin"
        ? {}
        : { createdBy: req.user.userId };

    const notes = await Note.find(filter)
      .populate("chapterId", "title chapterNumber")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });

  } catch (error) {
    console.error("Manage Notes Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch notes"
    });
  }
};


// CREATE Note
const createNote = async (req, res) => {
  try {
    const {
      title,
      chapterId,
      language,
      content
    } = req.body;

    if (!title?.trim() || !content?.trim() || !chapterId) {
      return res.status(400).json({
        success: false,
        message: "Title, Chapter ID and Content are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Chapter ID"
      });
    }

    const chapter = await Chapter.findById(chapterId);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found"
      });
    }

    if (language && !["Hindi", "English"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language"
      });
    }

    const note = await Note.create({
      title: title.trim(),
      chapterId,
      language: language || "Hindi",
      content: content.trim(),
      createdBy: req.user.userId,
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully as Draft",
      data: note
    });

  } catch (error) {
    console.error("Create Note Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create note"
    });
  }
};


// UPDATE Note
const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, language, chapterId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Note ID"
      });
    }

    const filter = { _id: noteId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const note = await Note.findOne(filter);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or access denied"
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty"
        });
      }
      note.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty"
        });
      }
      note.content = content.trim();
    }

    if (language !== undefined) {
      if (!["Hindi", "English"].includes(language)) {
        return res.status(400).json({
          success: false,
          message: "Invalid language"
        });
      }
      note.language = language;
    }

    if (chapterId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(chapterId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Chapter ID"
        });
      }

      const chapter = await Chapter.findById(chapterId);

      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: "Chapter not found"
        });
      }

      note.chapterId = chapterId;
    }

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note
    });

  } catch (error) {
    console.error("Update Note Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to update note"
    });
  }
};


// PUBLISH / UNPUBLISH Note
const togglePublishNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Note ID"
      });
    }

    const filter = { _id: noteId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const note = await Note.findOne(filter);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or access denied"
      });
    }

    note.isPublished = !note.isPublished;

    await note.save();

    res.status(200).json({
      success: true,
      message: note.isPublished
        ? "Note published successfully"
        : "Note unpublished successfully",
      data: note
    });

  } catch (error) {
    console.error("Publish Note Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to change publish status"
    });
  }
};


// DELETE Note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Note ID"
      });
    }

    const filter = { _id: noteId };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user.userId;
    }

    const note = await Note.findOneAndDelete(filter);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found or access denied"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });

  } catch (error) {
    console.error("Delete Note Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to delete note"
    });
  }
};


module.exports = {
  getNotesByChapter,
  getManageNotes,
  createNote,
  updateNote,
  togglePublishNote,
  deleteNote
};
