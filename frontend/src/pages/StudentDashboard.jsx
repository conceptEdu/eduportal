import { useEffect, useState } from "react";
import api from "../services/api";

function StudentDashboard({ student, onLogout, onOpenChapter }) {

  const [className, setClassName] = useState("Loading...");
  const [classError, setClassError] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectError, setSubjectError] = useState("");

  // Selected Subject
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Chapters
  const [chapters, setChapters] = useState([]);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState("");

  // Fetch Class
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await api.get("/classes");

        const classes = response.data.data || [];

        const studentClass = classes.find(
          (item) =>
            String(item._id) === String(student?.classId)
        );

        if (studentClass) {
          setClassName(
            studentClass.name ||
            `Class ${studentClass.classNumber}`
          );
        } else {
          setClassName("Not Assigned");
        }
      } catch (error) {
        console.error("Class Fetch Error:", error);
        setClassName("Unavailable");
        setClassError("Class information could not be loaded.");
      }
    };

    if (student?.classId) {
      fetchClass();
    } else {
      setClassName("Not Assigned");
    }
  }, [student?.classId]);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubjectLoading(true);
        setSubjectError("");

        const response = await api.get(
          `/subjects/class/${student.classId}`,
          {
            params: student.streamId
              ? { streamId: student.streamId }
              : {}
          }
        );

        setSubjects(response.data.data || []);
      } catch (error) {
        console.error("Subject Fetch Error:", error);

        setSubjectError(
          error.response?.data?.message ||
          "Subjects load नहीं हो सके।"
        );
      } finally {
        setSubjectLoading(false);
      }
    };

    if (student?.classId) {
      fetchSubjects();
    }
  }, [student?.classId, student?.streamId]);

  // Fetch Chapters when Subject is selected
  useEffect(() => {
    if (!selectedSubject?._id) return;

    const fetchChapters = async () => {
      try {
        setChapterLoading(true);
        setChapterError("");
        setChapters([]);

        const response = await api.get(
          `/chapters/subject/${selectedSubject._id}`
        );

        setChapters(response.data.data || []);
      } catch (error) {
        console.error("Chapter Fetch Error:", error);

        setChapterError(
          error.response?.data?.message ||
          "Chapters load नहीं हो सके।"
        );
      } finally {
        setChapterLoading(false);
      }
    };

    fetchChapters();
  }, [selectedSubject]);

  // Select Subject
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  // Back to Subjects
  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setChapters([]);
    setChapterError("");
  };

  return (
    <div className="student-dashboard">

      <header className="student-dashboard-header">
        <div>
          <h2>EduPortal Student Dashboard</h2>
          <p>Welcome, {student?.name}</p>
        </div>

        <button onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="student-dashboard-content">

        <h3>Student Panel</h3>

        {/* Student Profile */}
        <div className="student-profile-card">
          <h4>Student Profile</h4>

          <p>
            <strong>Name:</strong> {student?.name}
          </p>

          <p>
            <strong>Admission Number:</strong>{" "}
            {student?.admissionNumber}
          </p>

          <p>
            <strong>Mobile:</strong> {student?.mobile}
          </p>

          <p>
            <strong>Role:</strong> {student?.role}
          </p>

          <p>
            <strong>Class:</strong> {className}
          </p>

          <p>
            <strong>Stream:</strong>{" "}
            {student?.streamId || "Not Assigned"}
          </p>
        </div>

        {classError && (
          <p style={{ color: "red" }}>{classError}</p>
        )}

        {/* My Learning */}
        <section className="student-learning-section">
          <h3>My Learning</h3>

          <p>
            Welcome to EduPortal. यहाँ से आप अपने
            Class, Subjects, Chapters और Quizzes
            का अध्ययन कर सकेंगे।
          </p>
        </section>

        {/* My Subjects */}
        {!selectedSubject && (
          <section className="student-subjects">
            <h3>My Subjects</h3>

            {subjectLoading && (
              <p>Loading Subjects...</p>
            )}

            {subjectError && (
              <p style={{ color: "red" }}>
                {subjectError}
              </p>
            )}

            {!subjectLoading &&
              !subjectError &&
              subjects.length === 0 && (
                <p>No Subjects Available.</p>
              )}

            <div>
              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  type="button"
                  onClick={() => handleSubjectSelect(subject)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "12px",
                    margin: "8px 0",
                    cursor: "pointer"
                  }}
                >
                  {subject.name} →
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Selected Subject and Chapters */}
        {selectedSubject && (
          <section className="student-chapters">

            <button
              type="button"
              onClick={handleBackToSubjects}
            >
              ← Back to Subjects
            </button>

            <h3>
              {selectedSubject.name}
            </h3>

            <h4>Chapters</h4>

            {chapterLoading && (
              <p>Loading Chapters...</p>
            )}

            {chapterError && (
              <p style={{ color: "red" }}>
                {chapterError}
              </p>
            )}

            {!chapterLoading &&
              !chapterError &&
              chapters.length === 0 && (
                <p>No Chapters Available.</p>
              )}

            <div>
              {chapters.map((chapter) => (
  <button
    key={chapter._id}
    type="button"
    onClick={() => onOpenChapter(chapter)}
    style={{
      display: "block",
      width: "100%",
      textAlign: "left",
      padding: "12px",
      margin: "8px 0",
      border: "1px solid #ddd",
      borderRadius: "6px",
      cursor: "pointer",
      background: "#fff"
    }}
  >
    <strong>
      Chapter {chapter.chapterNumber}
    </strong>

    <p>{chapter.name}</p>
  </button>
))}

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default StudentDashboard;
