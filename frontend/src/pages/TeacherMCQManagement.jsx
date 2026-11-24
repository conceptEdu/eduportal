import { useEffect, useState } from "react";
import api from "../services/api";
import "./TeacherMCQManagement.css";

function TeacherMCQManagement() {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [mcqs, setMcqs] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [displayOrder, setDisplayOrder] = useState(1);

  const [editingMCQId, setEditingMCQId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getConfig = () => {
    const token = sessionStorage.getItem("eduportal_token");

    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    loadClasses();
    loadMCQs();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(response.data.data || []);
    } catch (err) {
      setError("Classes load नहीं हो सकीं।");
    }
  };

  const loadMCQs = async (chapterId = "") => {
    try {
      const url = chapterId
        ? `/mcq/manage?chapterId=${chapterId}`
        : "/mcq/manage";

      const response = await api.get(url, getConfig());

      setMcqs(
        response.data.mcqs ||
        response.data.data ||
        []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "MCQs load नहीं हो सके।"
      );
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;

    const classItem = classes.find(
      item => item._id === classId
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
      } catch {
        setError("Streams load नहीं हो सके।");
      }
    } else {
      loadSubjects(classId, "");
    }
  };

  const loadSubjects = async (classId, streamId) => {
    try {
      const url = streamId
        ? `/subjects/class/${classId}?streamId=${streamId}`
        : `/subjects/class/${classId}`;

      const response = await api.get(url);
      setSubjects(response.data.data || []);
    } catch {
      setError("Subjects load नहीं हो सके।");
    }
  };

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
    } catch {
      setError("Chapters load नहीं हो सके।");
    }
  };

  const handleChapterChange = (e) => {
    const chapterId = e.target.value;

    setSelectedChapter(chapterId);
    loadMCQs(chapterId);
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setExplanation("");
    setLanguage("Hindi");
    setDisplayOrder(1);
    setEditingMCQId(null);
    setError("");
  };

  const handleOptionChange = (index, value) => {
    setOptions(prev =>
      prev.map((option, i) =>
        i === index ? value : option
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!editingMCQId && !selectedChapter) {
        setError("कृपया Chapter चुनें।");
        return;
      }

      if (options.some(option => !option.trim())) {
        setError("चारों Options भरना आवश्यक है।");
        return;
      }

      const payload = {
        question,
        options,
        correctAnswer: Number(correctAnswer),
        explanation,
        language,
        displayOrder: Number(displayOrder)
      };

      if (editingMCQId) {
        await api.put(
          `/mcq/${editingMCQId}`,
          payload,
          getConfig()
        );

        setMessage("MCQ Successfully Updated.");
      } else {
        payload.chapterId = selectedChapter;

        await api.post(
          "/mcq",
          payload,
          getConfig()
        );

        setMessage("MCQ Draft के रूप में Save हो गया।");
      }

      resetForm();
      await loadMCQs(selectedChapter);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "MCQ Save नहीं हो सका।"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mcq) => {
    setEditingMCQId(mcq._id);
    setQuestion(mcq.question);
    setOptions([...mcq.options]);
    setCorrectAnswer(mcq.correctAnswer);
    setExplanation(mcq.explanation || "");
    setLanguage(mcq.language || "Hindi");
    setDisplayOrder(mcq.displayOrder || 1);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handlePublish = async (mcqId) => {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/mcq/${mcqId}/publish`,
        {},
        getConfig()
      );

      setMessage("MCQ Publish Status बदल गया।");
      await loadMCQs(selectedChapter);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Publish Status नहीं बदल सका।"
      );
    }
  };

  const handleDelete = async (mcqId) => {
    const confirmed = window.confirm(
      "क्या आप इस MCQ को Delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/mcq/${mcqId}`,
        getConfig()
      );

      setMessage("MCQ Delete हो गया।");
      await loadMCQs(selectedChapter);

      if (editingMCQId === mcqId) {
        resetForm();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "MCQ Delete नहीं हो सका।"
      );
    }
  };

  return (
    <div className="mcq-management">

      <h2>MCQ Quiz Management</h2>

      {message && (
        <div className="mcq-success">{message}</div>
      )}

      {error && (
        <div className="mcq-error">{error}</div>
      )}

      <div className="mcq-form-card">

        <h3>
          {editingMCQId ? "Edit MCQ" : "Add New MCQ"}
        </h3>

        <form onSubmit={handleSubmit}>

          {!editingMCQId && (
            <>
              <label>Select Class</label>

              <select
                value={selectedClass?._id || ""}
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

              {selectedClass?.hasStreams && (
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
                onChange={handleChapterChange}
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

          <label>MCQ Question</label>

          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="प्रश्न लिखें..."
            rows="3"
            required
          />

          <h4>चार विकल्प भरें</h4>

          {options.map((option, index) => (
            <div className="mcq-option-input" key={index}>
              <label>{String.fromCharCode(65 + index)}.</label>

              <input
                value={option}
                onChange={e =>
                  handleOptionChange(index, e.target.value)
                }
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                required
              />
            </div>
          ))}

          <label>सही उत्तर चुनें</label>

          <select
            value={correctAnswer}
            onChange={e =>
              setCorrectAnswer(Number(e.target.value))
            }
          >
            {options.map((option, index) => (
              <option key={index} value={index}>
                {String.fromCharCode(65 + index)} - {
                  option || `Option ${index + 1}`
                }
              </option>
            ))}
          </select>

          <label>Explanation</label>

          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder="उत्तर की व्याख्या लिखें..."
            rows="3"
          />

          <label>Language</label>

          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>

          <label>Display Order</label>

          <input
            type="number"
            min="1"
            value={displayOrder}
            onChange={e => setDisplayOrder(e.target.value)}
            required
          />

          <div className="mcq-form-actions">

            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingMCQId
                  ? "Update MCQ"
                  : "Save MCQ as Draft"}
            </button>

            {editingMCQId && (
              <button
                type="button"
                className="mcq-cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>
      </div>

      <div className="mcq-list-section">

        <h3>MCQ List ({mcqs.length})</h3>

        {mcqs.length === 0 ? (
          <p>अभी कोई MCQ उपलब्ध नहीं है।</p>
        ) : (
          mcqs.map(mcq => (
            <div className="teacher-mcq-card" key={mcq._id}>

              <h4>{mcq.question}</h4>

              <div className="teacher-mcq-options">
                {mcq.options?.map((option, index) => (
                  <p key={index}>
                    {String.fromCharCode(65 + index)}. {option}
                  </p>
                ))}
              </div>

              <p>
                <strong>Correct Answer:</strong>{" "}
                {String.fromCharCode(65 + mcq.correctAnswer)}
              </p>

              <p>
                <strong>Chapter:</strong>{" "}
                {mcq.chapterId?.title || "Chapter"}
              </p>

              <p>
                <strong>Language:</strong> {mcq.language}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {mcq.isPublished ? "Published" : "Draft"}
              </p>

              <div className="teacher-mcq-actions">

                <button onClick={() => handleEdit(mcq)}>
                  Edit
                </button>

                <button
                  className="mcq-publish-btn"
                  onClick={() => handlePublish(mcq._id)}
                >
                  {mcq.isPublished ? "Unpublish" : "Publish"}
                </button>

                <button
                  className="mcq-delete-btn"
                  onClick={() => handleDelete(mcq._id)}
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

export default TeacherMCQManagement;
