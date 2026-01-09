import { useState, useEffect } from 'react'

// Tutorial scenario: 30-year-old woman in 1st class
const TUTORIAL_PASSENGER = {
  sex: 0,      // Female
  pclass: 1,   // 1st class
  age: 30,
  fare: 84.0   // 1st class average
}

// Tutorial step definitions - Progressive highlighting
const TUTORIAL_STEPS = {
  0: {
    message: "Welcome! Let’s explore how two AI models, shown side by side, predict survival for a real Titanic passenger.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: -1,  // Empty state - no path visible yet
    highlight_features: null,
    button_text: "Start"
  },
  1: {
    message: "Start here. Both models focus first on sex—watch how the prediction shifts when the passenger is female.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 1,  // First split
    highlight_features: ["sex"],
    button_text: "Next"
  },
  2: {
    message: "Next, passenger class comes into play. Notice how being in 1st class nudges the prediction further toward survival.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 2,  // First two splits
    highlight_features: ["sex", "pclass"],
    button_text: "Next"
  },
  3: {
    message: "Now add age. It’s a smaller adjustment, but you can see how it fine-tunes the outcome.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 3,  // First three splits
    highlight_features: ["sex", "pclass", "age"],
    button_text: "Next"
  },
  4: {
    message: "Finally, fare adds the last bit of detail. This full path shows how multiple factors combine into a single prediction. Now it’s your turn—try other passengers using presets or chat.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 4,  // All four splits
    highlight_features: ["sex", "pclass", "age", "fare"],
    button_text: "Finish Tutorial"
  }
}

/**
 * Custom hook to manage tutorial state and logic
 *
 * @param {Function} onPassengerChange - Callback to update passenger values
 * @param {Function} onAddChatMessage - Callback to add tutorial message to chat
 * @returns {Object} Tutorial state and control functions
 */
function useTutorial(onPassengerChange, onAddChatMessage) {
  const [tutorialActive, setTutorialActive] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    // Check localStorage to see if user has seen tutorial before
    const seen = localStorage.getItem('hasSeenTutorial')
    return seen === 'true'
  })

  // Tutorial no longer auto-starts - user can manually start it via button
  // (Initial animation plays instead on first load)

  /**
   * Get the tutorial message for the current step
   */
  const getTutorialMessage = (stepNum) => {
    return TUTORIAL_STEPS[stepNum].message
  }

  /**
   * Start the tutorial from step 0
   */
  const startTutorial = () => {
    setTutorialActive(true)
    setTutorialStep(0)
    setHasSeenTutorial(true)
    localStorage.setItem('hasSeenTutorial', 'true')

    // Set passenger values to tutorial passenger
    if (onPassengerChange) {
      onPassengerChange(TUTORIAL_PASSENGER)
    }

    // Add welcome message to chat
    if (onAddChatMessage) {
      onAddChatMessage({
        role: 'assistant',
        type: 'tutorial',
        content: getTutorialMessage(0),
        step: 0,
        isLastStep: false
      })
    }
  }

  /**
   * Skip/exit the tutorial
   */
  const skipTutorial = () => {
    setTutorialActive(false)

    // Add skip message to chat
    if (onAddChatMessage) {
      onAddChatMessage({
        role: 'assistant',
        content: "Tutorial skipped. Feel free to explore on your own using the preset buttons, chat, or What-If controls!"
      })
    }
  }

  /**
   * Advance to the next tutorial step
   */
  const advanceTutorial = () => {
    if (tutorialStep < 4) {
      // Move to next step
      const nextStep = tutorialStep + 1
      setTutorialStep(nextStep)

      // Add step message to chat
      if (onAddChatMessage) {
        onAddChatMessage({
          role: 'assistant',
          type: 'tutorial',
          content: getTutorialMessage(nextStep),
          step: nextStep,
          isLastStep: nextStep >= 4
        })
      }
    } else {
      // Tutorial complete
      setTutorialActive(false)
    }
  }

  /**
   * Get the current tutorial highlight mode for the decision tree
   */
  const getHighlightMode = () => {
    if (!tutorialActive) {
      return null
    }
    return TUTORIAL_STEPS[tutorialStep].highlight_mode
  }

  /**
   * Get the list of features to highlight in the waterfall chart
   */
  const getHighlightFeatures = () => {
    if (!tutorialActive) {
      return null
    }
    return TUTORIAL_STEPS[tutorialStep].highlight_features
  }

  /**
   * Reset tutorial (for development/testing)
   */
  const resetTutorial = () => {
    setTutorialActive(false)
    setTutorialStep(0)
    setHasSeenTutorial(false)
    localStorage.removeItem('hasSeenTutorial')
  }

  return {
    tutorialActive,
    tutorialStep,
    hasSeenTutorial,
    startTutorial,
    skipTutorial,
    advanceTutorial,
    getHighlightMode,
    getHighlightFeatures,
    getCurrentStepInfo: () => TUTORIAL_STEPS[tutorialStep],
    resetTutorial
  }
}

export default useTutorial
