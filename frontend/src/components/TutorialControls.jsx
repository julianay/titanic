/**
 * TutorialControls - Tutorial navigation and progress UI
 *
 * Displays tutorial progress and Next/Skip/Finish buttons
 */
function TutorialControls({ tutorialActive, tutorialStep, onAdvance, onSkip }) {
  if (!tutorialActive) {
    return null
  }

  const stepInfo = tutorialStep
  const isLastStep = tutorialStep >= 2

  return (
    <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
      {/* Progress indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-300">
            📚 Tutorial: Step {tutorialStep + 1} of 3
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((step) => (
              <div
                key={step}
                className={`h-2 w-8 rounded-full transition-colors ${
                  step <= tutorialStep ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Button controls */}
      <div className="flex gap-2">
        <button
          onClick={onAdvance}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {isLastStep ? 'Finish Tutorial' : 'Next'}
        </button>

        {!isLastStep && (
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

export default TutorialControls
