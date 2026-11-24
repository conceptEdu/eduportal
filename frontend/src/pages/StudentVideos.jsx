import { useEffect, useState } from "react";
import api from "../services/api";

function StudentVideos({ chapter }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedVideo(null);

        const response = await api.get(
          `/videos/chapter/${chapter._id}`
        );

        const videoList =
  response.data.videos ||
  response.data.data ||
  [];

setVideos(videoList);

      } catch (err) {
        setError(
          err.response?.data?.message || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (chapter?._id) {
      fetchVideos();
    }
  }, [chapter?._id]);

  if (loading) {
    return <h2>Loading Videos...</h2>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="student-videos-container">
      <h2>{chapter.title}</h2>
      <h3>▶️ YouTube Video Lectures</h3>

      {videos.length === 0 && (
        <p>
          अभी इस Chapter के Published Videos उपलब्ध नहीं हैं।
        </p>
      )}

      {!selectedVideo &&
        videos.map((video) => (
          <div className="student-video-card" key={video._id}>
            <button
              className="student-video-thumbnail"
              onClick={() => setSelectedVideo(video)}
            >
              <img
                src={`https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                alt={video.title}
              />
              <span>▶ Play Video</span>
            </button>

            <h3>{video.title}</h3>

            <p>{video.description}</p>

            <small>
              Language: {video.language}
            </small>
          </div>
        ))}

      {selectedVideo && (
        <div className="student-video-player">
          <button
            onClick={() => setSelectedVideo(null)}
          >
            ← Back to Videos
          </button>

          <h2>{selectedVideo.title}</h2>

          <div className="youtube-player">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeVideoId}`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <p>{selectedVideo.description}</p>

          <small>
            Language: {selectedVideo.language}
          </small>
        </div>
      )}
    </div>
  );
}

export default StudentVideos;
