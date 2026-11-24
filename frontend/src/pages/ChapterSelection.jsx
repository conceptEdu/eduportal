import { useEffect, useState } from "react";
import api from "../services/api";
import NavigationButtons from "../components/NavigationButtons";

function ChapterSelection({
  subjectId,
  onBack,
  onNext,
  onHome
}) {
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedChapter(null);

        const response = await api.get(
          `/chapters/subject/${subjectId}`
        );

        setChapters(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchChapters();
    }
  }, [subjectId]);

  if (loading) return <h2>Loading Chapters...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h2>Select Chapter</h2>

      <div className="class-grid">
        {chapters.map((chapter) => (
          <button
            key={chapter._id}
            className={
              selectedChapter?._id === chapter._id
                ? "class-card selected-card"
                : "class-card"
            }
            onClick={() => {
  console.log("Chapter Clicked:", chapter);
  alert("Chapter Button Working!");
  setSelectedChapter(chapter);
  onNext(chapter);
}}

          >
            <span>
              Chapter {chapter.chapterNumber}
            </span>

            <p>{chapter.title}</p>
          </button>
        ))}
      </div>

      {chapters.length === 0 && (
        <p>No chapters available.</p>
      )}

      <NavigationButtons
        onBack={onBack}
        onNext={() => onNext(selectedChapter)}
        onHome={onHome}
        nextDisabled={!selectedChapter}
      />
    </div>
  );
}

export default ChapterSelection;
