import { useEffect, useState } from "react";
import api from "../services/api";

function StudentSubjectiveQA({ chapter }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAnswers, setOpenAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/subjective-qa/chapter/${chapter._id}`
        );

        setQuestions(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Questions load nahi ho paye."
        );
      } finally {
        setLoading(false);
      }
    };

    if (chapter?._id) {
      fetchQuestions();
    }
  }, [chapter?._id]);

  const toggleAnswer = (id) => {
    setOpenAnswers((previous) => ({
      ...previous,
      [id]: !previous[id]
    }));
  };

  if (loading) {
    return <p>Questions load ho rahe hain...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="student-qa-container">
      <h3>Subjective Questions & Answers</h3>

      <p>
        Chapter: {chapter.title}
      </p>

      {questions.length === 0 ? (
        <p>
          इस Chapter के लिए अभी कोई प्रश्न उपलब्ध नहीं है।
        </p>
      ) : (
        <>
          <p>
            Total Questions: {questions.length}
          </p>

          {questions.map((item, index) => (
            <div
              key={item._id}
              className="student-qa-card"
            >
              <h4>
                Q{index + 1}. {item.question}
              </h4>

              <p>
                Language: {item.language}
              </p>

              <button
                onClick={() => toggleAnswer(item._id)}
              >
                {openAnswers[item._id]
                  ? "Hide Answer"
                  : "Show Answer"}
              </button>

              {openAnswers[item._id] && (
                <div className="student-qa-answer">
                  <strong>Answer:</strong>
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default StudentSubjectiveQA;
