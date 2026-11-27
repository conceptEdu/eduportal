import { useEffect, useState } from "react";
import api from "../services/api";
import "./StudentMCQQuiz.css";

function StudentMCQQuiz({ chapter }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");
        setQuestions([]);
        setAnswers({});
        setResult(null);

        const response = await api.get(
          `/mcq/chapter/${chapter._id}`
        );

        setQuestions(response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "MCQ Questions load नहीं हो सके।"
        );
      } finally {
        setLoading(false);
      }
    };

    if (chapter?._id) {
      fetchQuestions();
    }
  }, [chapter?._id]);

  const handleAnswer = (questionId, optionIndex) => {
    if (result) return;

    setAnswers(previous => ({
      ...previous,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError("कृपया सभी प्रश्नों के उत्तर चुनें।");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        chapterId: chapter._id,
        answers: questions.map(question => ({
          questionId: question._id,
          selectedAnswer: answers[question._id]
        }))
      };

      const response = await api.post(
        "/mcq/submit",
        payload
      );

      setResult(response.data.result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Quiz Submit नहीं हो सका।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const restartQuiz = () => {
    setAnswers({});
    setResult(null);
    setError("");
  };

  if (loading) {
    return <p>MCQ Questions load हो रहे हैं...</p>;
  }

  if (error && questions.length === 0) {
    return <p className="mcq-student-error">{error}</p>;
  }

  return (
    <div className="student-mcq-container">

      <h2>MCQ Quiz</h2>

      <h3>{chapter.title}</h3>

      {questions.length === 0 ? (
        <p>
          इस Chapter के लिए अभी कोई Published MCQ उपलब्ध नहीं है।
        </p>
      ) : (
        <>
          <div className="student-mcq-summary">
            <p>Total Questions: {questions.length}</p>
            <p>
              Attempted: {Object.keys(answers).length}
            </p>
          </div>

          {questions.map((item, index) => (
            <div
              className="student-mcq-card"
              key={item._id}
            >
              <h4>
                Q{index + 1}. {item.question}
              </h4>

              {item.options.map((option, optionIndex) => {
                const isSelected =
                  answers[item._id] === optionIndex;

                const correctAnswer =
  result?.results?.find(
    r => String(r.questionId) === String(item._id)
  )?.correctAnswer;


                let optionClass = "";

                if (result && optionIndex === correctAnswer) {
                  optionClass = "mcq-correct-option";
                } else if (result && isSelected) {
                  optionClass = "mcq-wrong-option";
                }

                return (
                  <label
                    key={optionIndex}
                    className={`student-mcq-option ${optionClass}`}
                  >
                    <input
                      type="radio"
                      name={`question-${item._id}`}
                      checked={isSelected}
                      disabled={!!result}
                      onChange={() =>
                        handleAnswer(item._id, optionIndex)
                      }
                    />

                    <span>
                      {String.fromCharCode(65 + optionIndex)}.
                      {" "}{option}
                    </span>
                  </label>
                );
              })}

              {result && (() => {
                const answerResult = result.results.find(
  r => String(r.questionId) === String(item._id)
);


                return (
                  <div className="mcq-answer-explanation">
                    <p>
                      <strong>
                        {answerResult?.isCorrect
                          ? "✓ सही उत्तर"
                          : "✗ गलत उत्तर"}
                      </strong>
                    </p>

                    <p>
                      सही उत्तर: {
                        String.fromCharCode(
                          65 + answerResult.correctAnswer
                        )
                      }
                    </p>

                    {answerResult.explanation && (
                      <p>
                        <strong>Explanation:</strong>{" "}
                        {answerResult.explanation}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}

          {error && (
            <p className="mcq-student-error">{error}</p>
          )}

          {!result ? (
            <button
              className="mcq-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <div className="mcq-result-card">
              <h2>Quiz Result</h2>

              <h1>
                {result.score} / {result.totalQuestions}
              </h1>

              <h3>{result.percentage}%</h3>

              <p>
                Total Questions: {result.totalQuestions}
              </p>

              <p>
                Correct Answers: {result.correct}
              </p>

              <p>
                Incorrect Answers: {result.incorrect}
              </p>

              <button onClick={restartQuiz}>
                Retake Quiz
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StudentMCQQuiz;
