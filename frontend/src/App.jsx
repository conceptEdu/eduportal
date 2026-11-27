import { useState } from "react";

import ClassSelection from "./pages/ClassSelection";
import StreamSelection from "./pages/StreamSelection";
import SubjectSelection from "./pages/SubjectSelection";
import ChapterSelection from "./pages/ChapterSelection";
import ChapterContentHub from "./pages/ChapterContentHub";
import TeacherVideoManagement from "./pages/TeacherVideoManagement";
import BackendTest from "./components/BackendTest";

import TeacherLogin from "./pages/TeacherLogin";
import TeacherDashboard from "./pages/TeacherDashboard";

import StudentRegistration from "./components/StudentRegistration";
import StudentLogin from "./components/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";

import "./App.css";

function App() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const [history, setHistory] = useState([]);

  const [teacher, setTeacher] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("eduportal_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [student, setStudent] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem("eduportal_user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      return user?.role === "student" ? user : null;
    } catch {
      return null;
    }
  });

  const [step, setStep] = useState(() => {
    try {
      const token = sessionStorage.getItem("eduportal_token");
      const savedUser = sessionStorage.getItem("eduportal_user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      if (!token || !user) return "class";

      return user.role === "student"
        ? "student-dashboard"
        : "teacher-dashboard";
    } catch {
      return "class";
    }
  });

  // Current Page
  const getCurrentPage = () => ({
    step,
    selectedClass,
    selectedStream,
    selectedSubject,
    selectedChapter
  });

  // Restore Page
  const restorePage = (page) => {
    setStep(page.step);
    setSelectedClass(page.selectedClass);
    setSelectedStream(page.selectedStream);
    setSelectedSubject(page.selectedSubject);
    setSelectedChapter(page.selectedChapter);
  };

  // Navigation
  const navigate = (nextStep, changes = {}) => {
    const currentPage = getCurrentPage();

    const nextPage = {
      ...currentPage,
      ...changes,
      step: nextStep
    };

    setHistory((prev) => [...prev, currentPage]);
    restorePage(nextPage);
  };

  // Back
  const handleBack = () => {
    if (history.length === 0) return;

    const previousPage = history[history.length - 1];

    setHistory((prev) => prev.slice(0, -1));
    restorePage(previousPage);
  };

  // Home
  const handleHome = () => {
    setHistory([]);
    setSelectedClass(null);
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setStep("class");
  };

  // Class Selection
  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem);
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedChapter(null);

    navigate(
      classItem.hasStreams ? "stream" : "subject",
      {
        selectedClass: classItem,
        selectedStream: null,
        selectedSubject: null,
        selectedChapter: null
      }
    );
  };

  // Teacher Login
  const handleTeacherLogin = (user) => {
    setTeacher(user);
    setHistory([]);
    setStep("teacher-dashboard");
  };

  // Student Login
  const handleStudentLogin = (user) => {
    setStudent(user);
    setHistory([]);
    setStep("student-dashboard");
  };

  // Teacher Logout
  const handleTeacherLogout = () => {
    sessionStorage.removeItem("eduportal_token");
    sessionStorage.removeItem("eduportal_user");

    setTeacher(null);
    handleHome();
  };

  // Student Logout
  const handleStudentLogout = () => {
    sessionStorage.removeItem("eduportal_token");
    sessionStorage.removeItem("eduportal_user");

    setStudent(null);
    setHistory([]);
    setStep("student-login");
  };

  return (
    <>
      {/* Home Page */}
      {step === "class" && (
        <>
          <div className="teacher-entry">
            <button onClick={() => setStep("teacher-login")}>
              Teacher Login
            </button>

            <button onClick={() => setStep("student-login")}>
              Student Login
            </button>

            <button onClick={() => setStep("student-registration")}>
              Student Registration
            </button>

            <button onClick={() => setStep("backend-test")}>
              Test Backend Connection
            </button>

          </div>

          <ClassSelection
            onSelect={handleClassSelect}
            onHome={handleHome}
          />
        </>
      )}

      {/* Backend Connection Test */}
{step === "backend-test" && (
  <div>
    <BackendTest />


    <button onClick={() => setStep("class")}>
      Back to Home
    </button>
  </div>
)}


      {/* Student Registration */}
      {step === "student-registration" && (
  <StudentRegistration
    onRegistered={handleStudentLogin}
  />
)}


      {/* Student Login */}
      {step === "student-login" && (
        <StudentLogin
          onLogin={handleStudentLogin}
          onRegister={() => setStep("student-registration")}
        />
      )}

      {/* Student Dashboard */}
     {step === "student-dashboard" && (
  <StudentDashboard
    student={student}
    onLogout={handleStudentLogout}
    onOpenChapter={(chapter) => {
      setSelectedChapter(chapter);
      setStep("hub");
    }}
  />
)}


      {/* Teacher Login */}
      {step === "teacher-login" && (
        <TeacherLogin onLogin={handleTeacherLogin} />
      )}

      {/* Teacher Dashboard */}
      {step === "teacher-dashboard" && (
        <TeacherDashboard
          teacher={teacher}
          onLogout={handleTeacherLogout}
          onManageVideos={() => setStep("teacher-videos")}
        />
      )}

      {/* Teacher Videos */}
      {step === "teacher-videos" && (
        <TeacherVideoManagement />
      )}

      {/* Stream Selection */}
      {step === "stream" && (
        <StreamSelection
          classId={selectedClass._id}
          onBack={handleBack}
          onNext={(streamId) =>
            navigate("subject", {
              selectedStream: streamId
            })
          }
          onHome={handleHome}
        />
      )}

      {/* Subject Selection */}
      {step === "subject" && (
        <SubjectSelection
          classId={selectedClass._id}
          streamId={selectedStream}
          onBack={handleBack}
          onNext={(subject) =>
            navigate("chapter", {
              selectedSubject: subject
            })
          }
          onHome={handleHome}
        />
      )}

      {/* Chapter Selection */}
      {step === "chapter" && (
        <ChapterSelection
          subjectId={selectedSubject._id}
          onBack={handleBack}
          onNext={(chapter) =>
            navigate("hub", {
              selectedChapter: chapter
            })
          }
          onHome={handleHome}
        />
      )}

      {/* Chapter Content */}
      {step === "hub" && (
        <ChapterContentHub
          chapter={selectedChapter}
          onBack={handleBack}
          onHome={handleHome}
        />
      )}
    </>
  );
}

export default App;
