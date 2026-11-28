
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
    try {
      setLoadingStudents(true);
      setStudentError("");
      setStudents([]);
      setShowStudents(true);
      setStudentListType(type);

      const endpoint =
        type === "all"
          ? "/students"
          : "/students/my-class";

      const response = await api.get(endpoint);

      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Student List Error:", error);

      setStudentError(
        error.response?.data?.message ||
        "Students list load nahi ho saki."
      );
    } finally {
      setLoadingStudents(false);
    }
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

        {/* Student List Buttons */}
        <div className="teacher-student-entry">
          <h3>Student Management</h3>

          <button
            onClick={() => fetchStudents("all")}
            disabled={loadingStudents}
          >
            View All Students
          </button>

          <button
            onClick={() => fetchStudents("my-class")}
            disabled={loadingStudents}
          >
            My Class Students
          </button>
        </div>

        {/* Student List */}
        {showStudents && (
          <div className="teacher-student-list">

            <h3>
              {studentListType === "all"
                ? "All Students"
                : "My Class Students"}
            </h3>

            <button
              onClick={() => setShowStudents(false)}
            >
              Close List
            </button>

            {loadingStudents && (
              <p>Loading students...</p>
            )}

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
                      border="1"
                      cellPadding="8"
                      style={{
                        width: "100%",
                        borderCollapse: "collapse"
                      }}
                    >
                      <thead>
                        <tr>
                          <th>Sl. No.</th>
                          <th>Student Name</th>
                          <th>Admission No.</th>
                          <th>Class</th>
                          <th>Section</th>
                          <th>Stream</th>
                          <th>Mobile</th>
                        </tr>
                      </thead>

                      <tbody>
                        {students.map((student, index) => (
                          <tr key={student._id}>
                            <td>{index + 1}</td>
                            <td>{student.name}</td>
                            <td>{student.admissionNumber}</td>
                            <td>
                              {student.classId?.name ||
                                student.classId?.classNumber ||
                                "-"}
                            </td>
                            <td>
                              {student.sectionId?.name || "-"}
                            </td>
                            <td>
                              {student.streamId?.name || "-"}
                            </td>
                            <td>{student.mobile || "-"}</td>
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
