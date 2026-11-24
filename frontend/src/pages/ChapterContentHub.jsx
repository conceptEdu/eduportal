import { useState } from "react";
import ChapterNotes from "./ChapterNotes";
import StudentSubjectiveQA from "./StudentSubjectiveQA";
import NavigationButtons from "../components/NavigationButtons";
import StudentVideos from "./StudentVideos";
import StudentMCQQuiz from "./StudentMCQQuiz";


function ChapterContentHub({ chapter, onBack, onHome }) {
  const [selectedSection, setSelectedSection] = useState("");

  const sections = [
    {
      id: "notes",
      title: "Chapter Notes",
      description: "Read complete chapter notes",
      icon: "📚"
    },
    {
      id: "videos",
      title: "YouTube Videos",
      description: "Watch video lectures",
      icon: "▶️"
    },
    {
      id: "questions",
      title: "Subjective Q&A",
      description: "Practice written questions",
      icon: "✍️"
    },
    {
      id: "quiz",
      title: "MCQ Quiz",
      description: "Test your knowledge",
      icon: "📝"
    }
  ];

  const currentIndex = sections.findIndex(
    (item) => item.id === selectedSection
  );

  const handleBack = () => {
    if (currentIndex > 0) {
      setSelectedSection(sections[currentIndex - 1].id);
    } else if (currentIndex === 0) {
      setSelectedSection("");
    } else {
      onBack();
    }
  };

  const handleNext = () => {
    if (currentIndex === -1) return;

    if (currentIndex < sections.length - 1) {
      setSelectedSection(sections[currentIndex + 1].id);
    }
  };

  return (
    <div className="container">
      <h1>EduPortal</h1>

      <h2>{chapter.title}</h2>

      <p>Chapter {chapter.chapterNumber}</p>

      <h3>Select Learning Material</h3>

      <div className="class-grid">
        {sections.map((section) => (
          <button
            key={section.id}
            className={
              selectedSection === section.id
                ? "content-card selected-card"
                : "content-card"
            }
            onClick={() => setSelectedSection(section.id)}
          >
            <span className="content-icon">
              {section.icon}
            </span>

            <h3>{section.title}</h3>

            <p>{section.description}</p>
          </button>
        ))}
      </div>
      {selectedSection === "videos" && (
        <StudentVideos chapter={chapter} />
   )}

      {selectedSection === "notes" && (
        <ChapterNotes chapter={chapter} />
      )}

      {selectedSection === "questions" && (
        <StudentSubjectiveQA chapter={chapter} />
      )}

      {selectedSection === "quiz" && (
         <StudentMCQQuiz chapter={chapter} />
      )}

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        onHome={onHome}
        nextDisabled={
          currentIndex === -1 ||
          currentIndex === sections.length - 1
        }
      />
    </div>
  );
}

export default ChapterContentHub;
