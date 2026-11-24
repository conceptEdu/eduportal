import { useEffect, useState } from "react";
import api from "../services/api";
import NavigationButtons from "../components/NavigationButtons";

function StreamSelection({ classId, onBack, onNext, onHome }) {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await api.get(
          `/streams/class/${classId}`
        );

        setStreams(response.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, [classId]);

  if (loading) return <h2>Loading Streams...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h2>Select Your Stream</h2>

      <div className="class-grid">
        {streams.map((stream) => (
          <button
            key={stream._id}
            className={
              selectedStream === stream._id
                ? "class-card selected-card"
                : "class-card"
            }
            onClick={() => setSelectedStream(stream._id)}
          >
            {stream.name}
          </button>
        ))}
      </div>

      <NavigationButtons
        onBack={onBack}
        onNext={() => onNext(selectedStream)}
        onHome={onHome}
        nextDisabled={!selectedStream}
      />
    </div>
  );
}

export default StreamSelection;
