import { useEffect, useState } from "react";
import api from "../services/api";
import "./TeacherVideoManagement.css";

function TeacherVideoManagement() {
  const [classes, setClasses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [displayOrder, setDisplayOrder] = useState(1);

  const [editingVideoId, setEditingVideoId] = useState(null);
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

  // YouTube Video ID निकालना
  const getYouTubeId = (url) => {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.replace(/^www\./, "");

      let id = "";

      if (hostname === "youtu.be") {
        id = parsedUrl.pathname.split("/")[1];
      } else if (
        ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(hostname)
      ) {
        if (parsedUrl.pathname === "/watch") {
          id = parsedUrl.searchParams.get("v");
        } else {
          const parts = parsedUrl.pathname.split("/");

          if (["embed", "shorts", "live"].includes(parts[1])) {
            id = parts[2];
          }
        }
      }

      return /^[a-zA-Z0-9_-]{11}$/.test(id || "") ? id : "";
    } catch {
      return "";
    }
  };

  const videoId = getYouTubeId(youtubeUrl);

  // Load Classes and Videos
  useEffect(() => {
    loadClasses();
    loadVideos();
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

  // Load Teacher Videos
  const loadVideos = async () => {
    try {
      const response = await api.get(
        "/videos/manage",
        getConfig()
      );

      setVideos(
        response.data.videos ||
        response.data.data ||
        []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Videos load नहीं हो सके।"
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
    setYoutubeUrl("");
    setDescription("");
    setLanguage("Hindi");
    setDisplayOrder(1);
    setEditingVideoId(null);
    setError("");
  };

  // Add / Update Video
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!videoId) {
        setError("कृपया सही YouTube URL डालें।");
        return;
      }

      const payload = {
        title,
        youtubeUrl,
        description,
        language,
        displayOrder: Number(displayOrder)
      };

      if (editingVideoId) {
        await api.put(
          `/videos/${editingVideoId}`,
          payload,
          getConfig()
        );

        setMessage("Video successfully updated.");
      } else {
        if (!selectedChapter) {
          setError("कृपया Chapter चुनें।");
          return;
        }

        payload.chapterId = selectedChapter;

        await api.post(
          "/videos",
          payload,
          getConfig()
        );

        setMessage("Video Draft के रूप में Save हो गया।");
      }

      resetForm();
      await loadVideos();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Video Save नहीं हो सका।"
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit Video
  const handleEdit = (video) => {
    setEditingVideoId(video._id);
    setTitle(video.title);
    setYoutubeUrl(video.youtubeUrl);
    setDescription(video.description || "");
    setLanguage(video.language || "Hindi");
    setDisplayOrder(video.displayOrder || 1);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Publish / Unpublish
  const handlePublish = async (videoId) => {
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/videos/${videoId}/publish`,
        {},
        getConfig()
      );

      setMessage("Publish Status बदल गया।");
      await loadVideos();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Publish Status नहीं बदल सका।"
      );
    }
  };

  // Delete Video
  const handleDelete = async (videoId) => {
    const confirmed = window.confirm(
      "क्या आप इस Video को Delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.delete(
        `/videos/${videoId}`,
        getConfig()
      );

      setMessage("Video Delete हो गया।");
      await loadVideos();

      if (editingVideoId === videoId) {
        resetForm();
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Video Delete नहीं हो सका।"
      );
    }
  };

  return (
    <div className="video-management">

      <h2>YouTube Video Management</h2>

      {message && (
        <div className="video-success">{message}</div>
      )}

      {error && (
        <div className="video-error">{error}</div>
      )}

      {/* Video Form */}
      <div className="video-form-card">

        <h3>
          {editingVideoId ? "Edit Video" : "Add New Video"}
        </h3>

        <form onSubmit={handleSubmit}>

          {!editingVideoId && (
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

          <label>Video Title</label>

          <input
            type="text"
            placeholder="Enter Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>YouTube Video URL</label>

          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
          />

          {/* Thumbnail Preview */}
          {videoId && (
            <div className="video-preview">
              <label>YouTube Thumbnail Preview</label>

              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt="YouTube Video Thumbnail"
              />

              <p>Video ID: {videoId}</p>
            </div>
          )}

          <label>Description</label>

          <textarea
            placeholder="Enter Video Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />

          <label>Language</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>

          <label>Display Order</label>

          <input
            type="number"
            min="1"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            required
          />

          <div className="video-form-actions">

            <button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingVideoId
                  ? "Update Video"
                  : "Save Video as Draft"}
            </button>

            {editingVideoId && (
              <button
                type="button"
                className="cancel-video-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

        </form>
      </div>

      {/* Video List */}
      <div className="video-list-section">

        <h3>My Videos ({videos.length})</h3>

        {videos.length === 0 ? (
          <p>अभी कोई Video उपलब्ध नहीं है।</p>
        ) : (
          videos.map((video) => (
            <div className="teacher-video-card" key={video._id}>

              <div className="teacher-video-thumbnail">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                  alt={video.title}
                />
              </div>

              <div className="teacher-video-info">

                <h4>{video.title}</h4>

                <p>
                  Chapter: {video.chapterId?.title || "Chapter"}
                </p>

                <p>Language: {video.language}</p>

                <p>
                  Order: {video.displayOrder}
                </p>

                <p className="video-status">
                  Status: {video.isPublished ? "Published" : "Draft"}
                </p>

              </div>

              <div className="teacher-video-actions">

                <button onClick={() => handleEdit(video)}>
                  Edit
                </button>

                <button
                  className="publish-video-btn"
                  onClick={() => handlePublish(video._id)}
                >
                  {video.isPublished ? "Unpublish" : "Publish"}
                </button>

                <button
                  className="delete-video-btn"
                  onClick={() => handleDelete(video._id)}
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

export default TeacherVideoManagement;
