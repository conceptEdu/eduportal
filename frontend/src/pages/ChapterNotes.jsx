import { useEffect, useState } from "react";
import api from "../services/api";

function ChapterNotes({ chapter }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedNote(null);

        const response = await api.get(
          `/notes/chapter/${chapter._id}`
        );

        setNotes(response.data.data || []);

      } catch (err) {
        setError(
          err.response?.data?.message || err.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (chapter?._id) {
      fetchNotes();
    }
  }, [chapter?._id]);

  if (loading) {
    return <h2>Loading Notes...</h2>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="notes-container">
      <h2>{chapter.title}</h2>
      <h3>Chapter Notes</h3>

      {notes.length === 0 && (
        <p>
          अभी इस Chapter के Notes उपलब्ध नहीं हैं।
        </p>
      )}

      {!selectedNote && notes.map((note) => (
        <button
          key={note._id}
          className="note-card"
          onClick={() => setSelectedNote(note)}
        >
          <h3>{note.title}</h3>
          <small>{note.language}</small>
        </button>
      ))}

      {selectedNote && (
        <div className="note-content">
          <button
            onClick={() => setSelectedNote(null)}
          >
            ← Back to Notes
          </button>

          <h2>{selectedNote.title}</h2>

          <p>
            Language: {selectedNote.language}
          </p>

          <div className="note-text">
            {selectedNote.content}
          </div>

          <button onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default ChapterNotes;
