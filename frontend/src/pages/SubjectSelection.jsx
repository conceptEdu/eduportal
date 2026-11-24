import { useEffect, useState } from "react";
import api from "../services/api";
import NavigationButtons from "../components/NavigationButtons";

function SubjectSelection({
  classId,
  streamId,
  onBack,
  onNext,
  onHome
}) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedSubject(null);

        const response = await api.get(
          `/subjects/class/${classId}`,
          {
            params: streamId ? { streamId } : {}
          }
        );

        setSubjects(response.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [classId, streamId]);

  if (loading) return <h2>Loading Subjects...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h2>Select Subject</h2>

      <div className="class-grid">
        {subjects.map((subject) => (
          <button
            key={subject._id}
            className={
              selectedSubject?._id === subject._id
                ? "class-card selected-card"
                : "class-card"
            }
            onClick={() => setSelectedSubject(subject)}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {subjects.length === 0 && (
        <p>No subjects available.</p>
      )}

      <NavigationButtons
        onBack={onBack}
        onNext={() => onNext(selectedSubject)}
        onHome={onHome}
        nextDisabled={!selectedSubject}
      />
    </div>
  );
}

export default SubjectSelection;
