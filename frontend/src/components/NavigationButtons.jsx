import "./NavigationButtons.css";


function NavigationButtons({
  onBack,
  onNext,
  onHome,
  backDisabled = false,
  nextDisabled = false
}) {
  return (
    <div className="navigation-buttons">

      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className="nav-btn back-btn"
      >
        ← Back
      </button>

      <button
        type="button"
        onClick={onHome}
        className="nav-btn home-btn"
      >
        🏠 Home
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="nav-btn next-btn"
      >
        Next →
      </button>

    </div>
  );
}

export default NavigationButtons;
