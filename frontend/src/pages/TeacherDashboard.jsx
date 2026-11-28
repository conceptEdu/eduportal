
import { useState } from "react";
import api from "../services/api";
import "./TeacherDashboard.css";

import TeacherNotesManagement from "./TeacherNotesManagement";
import TeacherQAManagement from "./TeacherQAManagement";
import TeacherMCQManagement from "./TeacherMCQManagement";
import TeacherBulkAdmission from "./TeacherBulkAdmission";

function TeacherDashboard({ teacher, onLogout, onManageVideos }) {
  const [students, setStudents] = useState([]);
  const [showStudents, setShowStudents] = useState(false);
  const [studentListType, setStudentListType] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState("");

  const fetchStudents = async (type) => {
    setShowStudents(true);
    setStudentListType(type);
    setLoadingStudents(true);
    setStudentError("");
    setStudents([]);

    try {
      const endpoint =
        type === "all" ? "/students" : "/students/my-class";

      const response = await api.get(endpoint);

      if (response.data?.success) {
        setStudents(response.data.data || []);
      } else {
        setStudentError(
          response.data?.message || "Student list nahi mili."
        );
      }
    } catch (error) {
      console.error("Student List Error:", error);

      setStudentError(
        error.response?.data?.message ||
        error.message ||
        "Students list load nahi ho saki."
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const studentButtonStyle = {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "13px 18px",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    margin: "5px",
    minHeight: "46px"
  };

  return (
    <div className="teacher-dashboard">

      <header className="teacher-dashboard-header">
        <div>
          <h2>EduPortal Teacher Dashboard</h2>
          <p>Welcome, {teacher?.name}</p>
        </div>

        <button onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="teacher-dashboard-content">

        <h3>Teacher Panel</h3>

        {/* Teacher Profile */}
        <div className="teacher-profile-card">
          <h4>Teacher Profile</h4>

          <p>
            <strong>Name:</strong> {teacher?.name}
          </p>

          <p>
            <strong>Email:</strong> {teacher?.email}
          </p>

          <p>
            <strong>Role:</strong> {teacher?.role}
          </p>
        </div>

        {/* STUDENT MANAGEMENT */}
        <section
          style={{
            display: "block",
            visibility: "visible",
            width: "100%",
            boxSizing: "border-box",
            background: "#ffffff",
            padding: "22px",
            margin: "25px 0",
            borderRadius: "12px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.10)"
          }}
        >
          <h3 style={{ color: "#1e293b", marginTop: "0" }}>
            Student Management
          </h3>

          <p>विद्यार्थियों की सूची देखने के लिए बटन चुनें।</p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <button
              type="button"
              style={studentButtonStyle}
              disabled={loadingStudents}
              onClick={() => fetchStudents("all")}
            >
              View All Students
            </button>

            <button
              type="button"
              style={{
                ...studentButtonStyle,
                backgroundColor: "#15803d"
              }}
              disabled={loadingStudents}
              onClick={() => fetchStudents("my-class")}
            >
              My Class Students
            </button>
          </div>

          {/* STUDENT RESULTS */}
          {showStudents && (
            <div
              style={{
                marginTop: "22px",
                padding: "15px",
                background: "#f8fafc",
                borderRadius: "10px"
              }}
            >
              <h3>
                {studentListType === "all"
                  ? "All Students"
                  : "My Class Students"}
              </h3>

              <button
                type="button"
                onClick={() => setShowStudents(false)}
                style={{
                  background: "#dc2626",
                  color: "white",
                  padding: "9px 15px",
                  border: "none",
                  borderRadius: "6px"
                }}
              >
                Close List
              </button>

              {loadingStudents && <p>Loading students...</p>}

              {studentError && (
                <p style={{ color: "red" }}>
                  {studentError}
                </p>
              )}

              {!loadingStudents && !studentError && (
                <>
                  <p>
                    Total Students: {students.length}
                  </p>

                  {students.length === 0 ? (
                    <p>No students found.</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          minWidth: "650px",
                          borderCollapse: "collapse",
                          background: "white"
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#1e40af", color: "white" }}>
                            <th>Sl. No.</th>
                            <th>Student Name</th>
                            <th>Admission No.</th>
                            <th>Class</th>
                            <th>Section</th>
                            <th>Stream</th>
                            <th>Mobile</th>
                            <th>Registration Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {students.map((student, index) => (
                            <tr key={student._id}>
                              <td>{index + 1}</td>
                              <td>{student.name || "-"}</td>
                              <td>{student.admissionNumber || "-"}</td>
                              <td>
                                {student.classId?.name ||
                                  student.classId?.classNumber ||
                                  "-"}
                              </td>
                              <td>{student.sectionId?.name || "-"}</td>
                              <td>{student.streamId?.name || "-"}</td>
                              <td>{student.mobile || "-"}</td>
                              <td>{student.registrationStatus === "Registered"
                                    ? "Registered": "Pending"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        {/* Bulk Student Admission */}
        <TeacherBulkAdmission />

        {/* Video Management */}
        <div className="teacher-video-entry">
          <h3>YouTube Video Management</h3>

          <p>
            अपने Chapter के लिए YouTube Videos जोड़ें,
            Edit करें और Publish करें।
          </p>

          <button onClick={onManageVideos}>
            Manage Videos
          </button>
        </div>

        {/* Existing Modules */}
        <TeacherNotesManagement />
        <TeacherQAManagement />
        <TeacherMCQManagement />

      </main>
    </div>
  );
}

export default TeacherDashboard;
