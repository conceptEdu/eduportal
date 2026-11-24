import { useEffect, useState } from "react";
import api from "../services/api";
import "./TeacherQAManagement.css";

function TeacherQAManagement() {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [language, setLanguage] = useState("Hindi");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("eduportal_token")}`
    }
  });

  useEffect(() => {
    loadClasses();
    loadQuestions();
  }, []);

  // Load Classes
  const loadClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(response.data.data || []);
    } catch (err) {
      setError("Classes load नहीं हो सकीं।");
    }
  };

  // Load Teacher Questions
  const loadQuestions = async () => {
    try {
      const response = await api.get(
        "/subjective-qa/manage",
        getConfig()
      );

      setQuestions(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Questions load नहीं हो सके।"
      );
    }
  };

  // Class Selection
  const handleClassChange = async (e) => {
    const classId = e.target.value;
    const classItem = classes.find(item => item._id === classId);

    setSelectedClass(classId);
    setSelectedStream("");
    setSelectedSubject("");
    setSelectedChapter("");

    setStreams([]);
    setSubjects([]);
    setChapters([]);

    if (!classItem) return;

    try {
      if (classItem.hasStreams) {
        const response = await api.get(
          `/streams/class/${classId}`
        );
        setStreams(response.data.data || []);
      } else {
        await loadSubjects(classId, "");
      }
    } catch (err) {
      setError("Streams load नहीं हो सके।");
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
      loadSubjects(selectedClass, streamId);
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
    setQuestion("");
    setAnswer("");
    setLanguage("Hindi");
    setEditingId(null);
    setError("");
  };

  // Add / Update Question
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        question,
        answer,
        language
      };

      if (editingId) {
        await api.put(
          `/subjective-qa/${editingId}`,
          payload,
          getConfig()
        );

        setMessage("Question और Answer Update हो गए।");
      } else {
        if (!selectedChapter) {
          setError("कृपया Chapter चुनें।");
          return;
        }

        payload.chapterId = selectedChapter;

        await api.post(
          "/subjective-qa",
          payload,
          getConfig()
        );

        setMessage("Question Draft के रूप में Save हो गया।");
      }

      resetForm();
      await loadQuestions();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Question Save नहीं हो सका।"
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit Question
  const handleEdit = (item) => {
    setEditingId(item._id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setLanguage(item.language);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Publish / Unpublish
  const handlePublish = async (qaId) => {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/subjective-qa/${qaId}/publish`,
        {},
        getConfig()
      );

      setMessage("Publish Status बदल गया।");
      await loadQuestions();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Publish Status नहीं बदल सका।"
      );
    }
  };

  // Delete Question
  const handleDelete = async (qaId) => {
    const confirmed = window.confirm(
      "क्या आप यह Question Delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(
        `/subjective-qa/${qaId}`,
        getConfig()
      );

      setMessage("Question Delete हो गया।");
      await loadQuestions();

      if (editingId === qaId) {
        resetForm();
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Question Delete नहीं हो सका।"
      );
    }
  };

  return (
    <div className="qa-management">

      <h2>Subjective Q&A Management</h2>

      {message && (
        <div className="qa-success">{message}</div>
      )}

      {error && (
        <div className="qa-error">{error}</div>
      )}

      {/* Question Form */}
      <div className="qa-form-card">

        <h3>{editingId ? "Edit Question" : "Add New Question"}</h3>

        <form onSubmit={handleSubmit}>

          {!editingId && (
            <>
              <label>Select Class</label>

              <select
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="">Select Class</option>

                {classes.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name || `Class ${item.classNumber}`}
                  </option>
                ))}
              </select>

              {streams.length > 0 && (
                <>
                  <label>Select Stream</label>

                  <select
                    value={selectedStream}
                    onChange={handleStreamChange}
                    required
                  >
                    <option value="">Select Stream</option>

                    {streams.map(item => (
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

                {subjects.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              <label>Select Chapter</label>

              <select
                value={selectedChapter}
                onChange={e => setSelectedChapter(e.target.value)}
                required
                disabled={!chapters.length}
              >
                <option value="">Select Chapter</option>

                {chapters.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Question</label>

          <textarea
            rows="3"
            placeholder="अपना प्रश्न लिखें..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />

          <label>Answer</label>

          <textarea
            rows="7"
            placeholder="प्रश्न का उत्तर लिखें..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            required
          />

          <label>Language</label>

          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>

          <div className="qa-form-actions">

            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Question"
                  : "Save as Draft"}
            </button>

            {editingId && (
              <button
                type="button"
                className="qa-cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>
      </div>

      {/* Questions List */}
      <div className="qa-list-section">

        <h3>My Questions ({questions.length})</h3>

        {questions.length === 0 ? (
          <p>अभी कोई Question उपलब्ध नहीं है।</p>
        ) : (
          questions.map(item => (
            <div className="qa-item-card" key={item._id}>

              <div className="qa-item-info">

                <h4>{item.question}</h4>

                <p>
                  Chapter: {item.chapterId?.title || "Chapter"}
                </p>

                <p>Language: {item.language}</p>

                <p className="qa-answer-preview">
                  Answer: {item.answer}
                </p>

                <p>
                  Status:{" "}
                  <strong>
                    {item.isPublished ? "Published" : "Draft"}
                  </strong>
                </p>

              </div>

              <div className="qa-item-actions">

                <button onClick={() => handleEdit(item)}>
                  Edit
                </button>

                <button
                  className="qa-publish-btn"
                  onClick={() => handlePublish(item._id)}
                >
                  {item.isPublished ? "Unpublish" : "Publish"}
                </button>

                <button
                  className="qa-delete-btn"
                  onClick={() => handleDelete(item._id)}
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

export default TeacherQAManagement;
