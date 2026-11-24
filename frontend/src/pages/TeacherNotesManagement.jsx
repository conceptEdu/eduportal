import { useEffect, useState } from "react";
import api from "../services/api";
import "./TeacherNotesManagement.css";

function TeacherNotesManagement() {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [notes, setNotes] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [content, setContent] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Authorization Header
  const getConfig = () => {
    const token = sessionStorage.getItem("eduportal_token");

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Load Classes and Notes
  useEffect(() => {
    loadClasses();
    loadNotes();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(response.data.data || []);
    } catch (err) {
      setError("Classes load नहीं हो सकीं।");
    }
  };

  // Load Teacher Notes
  const loadNotes = async () => {
    try {
      const response = await api.get(
        "/notes/manage",
        getConfig()
      );

      setNotes(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Notes load नहीं हो सके।"
      );
    }
  };

  // Class Selection
  const handleClassChange = async (e) => {
    const classId = e.target.value;

    const classItem = classes.find(
      (item) => item._id === classId
    );

    setSelectedClass(classItem || null);
    setSelectedStream("");
    setSelectedSubject("");
    setSelectedChapter("");

    setStreams([]);
    setSubjects([]);
    setChapters([]);

    if (!classItem) return;

    if (classItem.hasStreams) {
      try {
        const response = await api.get(
          `/streams/class/${classId}`
        );

        setStreams(response.data.data || []);
      } catch (err) {
        setError("Streams load नहीं हो सके।");
      }
    } else {
      loadSubjects(classId, "");
    }
  };

  // Load Subjects
  const loadSubjects = async (classId, streamId) => {
    try {
      const url = streamId
        ? `/subjects/class/${classId}?streamId=${streamId}`
        : `/subjects/class/${classId}`;

      const response = await api.get(url);

      setSubjects(response.data.data || []);
    } catch (err) {
      setError("Subjects load नहीं हो सके।");
    }
  };

  // Stream Selection
  const handleStreamChange = (e) => {
    const streamId = e.target.value;

    setSelectedStream(streamId);
    setSelectedSubject("");
    setSelectedChapter("");
    setSubjects([]);
    setChapters([]);

    if (streamId && selectedClass) {
      loadSubjects(selectedClass._id, streamId);
    }
  };

  // Subject Selection
  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;

    setSelectedSubject(subjectId);
    setSelectedChapter("");
    setChapters([]);

    if (!subjectId) return;

    try {
      const response = await api.get(
        `/chapters/subject/${subjectId}`
      );

      setChapters(response.data.data || []);
    } catch (err) {
      setError("Chapters load नहीं हो सके।");
    }
  };

  // Reset Form
  const resetForm = () => {
    setTitle("");
    setLanguage("Hindi");
    setContent("");
    setEditingNoteId(null);
    setError("");
  };

  // Add / Update Note
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        title,
        language,
        content
      };

      if (editingNoteId) {
        await api.put(
          `/notes/${editingNoteId}`,
          payload,
          getConfig()
        );

        setMessage("Note successfully updated.");
      } else {
        if (!selectedChapter) {
          setError("कृपया Chapter चुनें।");
          setLoading(false);
          return;
        }

        payload.chapterId = selectedChapter;

        await api.post(
          "/notes",
          payload,
          getConfig()
        );

        setMessage("Note Draft के रूप में Save हो गया।");
      }

      resetForm();
      await loadNotes();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Note Save नहीं हो सका।"
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit Note
  const handleEdit = (note) => {
    setEditingNoteId(note._id);
    setTitle(note.title);
    setLanguage(note.language);
    setContent(note.content);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Publish / Unpublish
  const handlePublish = async (noteId) => {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/notes/${noteId}/publish`,
        {},
        getConfig()
      );

      setMessage("Publish Status बदल गया।");
      await loadNotes();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Publish Status नहीं बदल सका।"
      );
    }
  };

  // Delete Note
  const handleDelete = async (noteId) => {
    const confirmed = window.confirm(
      "क्या आप इस Note को Delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(
        `/notes/${noteId}`,
        getConfig()
      );

      setMessage("Note Delete हो गया।");
      await loadNotes();

      if (editingNoteId === noteId) {
        resetForm();
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Note Delete नहीं हो सका।"
      );
    }
  };

  return (
    <div className="notes-management">

      <h2>Notes Management</h2>

      {message && (
        <div className="notes-success">
          {message}
        </div>
      )}

      {error && (
        <div className="notes-error">
          {error}
        </div>
      )}

      {/* Note Form */}
      <div className="note-form-card">

        <h3>
          {editingNoteId ? "Edit Note" : "Add New Note"}
        </h3>

        <form onSubmit={handleSubmit}>

          {!editingNoteId && (
            <>
              <label>Select Class</label>

              <select
                value={selectedClass?._id || ""}
                onChange={handleClassChange}
                required
              >
                <option value="">Select Class</option>

                {classes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name || `Class ${item.classNumber}`}
                  </option>
                ))}
              </select>

              {selectedClass?.hasStreams && (
                <>
                  <label>Select Stream</label>

                  <select
                    value={selectedStream}
                    onChange={handleStreamChange}
                    required
                  >
                    <option value="">Select Stream</option>

                    {streams.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label>Select Subject</label>

              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                required
                disabled={!subjects.length}
              >
                <option value="">Select Subject</option>

                {subjects.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <label>Select Chapter</label>

              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                required
                disabled={!chapters.length}
              >
                <option value="">Select Chapter</option>

                {chapters.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Note Title</label>

          <input
            type="text"
            placeholder="Enter Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Language</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>

          <label>Note Content</label>

          <textarea
            placeholder="Write your Notes here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="8"
            required
          />

          <div className="note-form-actions">

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingNoteId
                  ? "Update Note"
                  : "Save Note as Draft"}
            </button>

            {editingNoteId && (
              <button
                type="button"
                className="cancel-note-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>
      </div>

      {/* Notes List */}
      <div className="notes-list-section">

        <h3>My Notes ({notes.length})</h3>

        {notes.length === 0 ? (
          <p>अभी कोई Note उपलब्ध नहीं है।</p>
        ) : (
          notes.map((note) => (
            <div className="teacher-note-card" key={note._id}>

              <div className="teacher-note-info">

                <h4>{note.title}</h4>

                <p>
                  Chapter: {note.chapterId?.title || "Chapter"}
                </p>

                <p>
                  Language: {note.language}
                </p>

                <p className="note-status">
                  Status:{" "}
                  {note.isPublished ? "Published" : "Draft"}
                </p>

              </div>

              <div className="teacher-note-actions">

                <button
                  onClick={() => handleEdit(note)}
                >
                  Edit
                </button>

                <button
                  onClick={() => handlePublish(note._id)}
                  className="publish-note-btn"
                >
                  {note.isPublished ? "Unpublish" : "Publish"}
                </button>

                <button
                  onClick={() => handleDelete(note._id)}
                  className="delete-note-btn"
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}

export default TeacherNotesManagement;
