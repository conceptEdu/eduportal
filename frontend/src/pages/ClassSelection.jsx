import { useEffect, useState } from "react";
import api from "../services/api";
import NavigationButtons from "../components/NavigationButtons";

function ClassSelection({ onSelect, onHome }) {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/classes");
        setClasses(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h1>EduPortal</h1>
      <h2>Select Your Class</h2>

      <div className="class-grid">
        {classes.map((item) => (
          <button
            key={item._id}
            className={
              selectedClass?._id === item._id
                ? "class-card selected-card"
                : "class-card"
            }
            onClick={() => setSelectedClass(item)}
          >
            <span>{item.name}</span>
            <small>
              {item.hasStreams
                ? "Select Stream"
                : "Select Class"}
            </small>
          </button>
        ))}
      </div>

      <NavigationButtons
        onBack={() => {}}
        onNext={() => onSelect(selectedClass)}
        onHome={onHome}
        backDisabled={true}
        nextDisabled={!selectedClass}
      />
    </div>
  );
}

export default ClassSelection;
