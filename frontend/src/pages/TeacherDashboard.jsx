import TeacherNotesManagement from "./TeacherNotesManagement";
import TeacherQAManagement from "./TeacherQAManagement";
import TeacherMCQManagement from "./TeacherMCQManagement";

// NEW: Bulk Admission Component
import TeacherBulkAdmission from "./TeacherBulkAdmission";
 
function TeacherDashboard({ teacher, onLogout, onManageVideos }) {
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

        {/* NEW: Bulk Student Admission */}
        <TeacherBulkAdmission />
 
        {/* Video Management Button */}
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
