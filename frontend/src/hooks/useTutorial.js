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
    message: "👋 Welcome to the Explainable AI Explorer! Let me show you how these models make predictions. We'll explore a 30-year-old woman in 1st class traveling on the Titanic.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: -1,  // Empty state - no path visible yet
    highlight_features: null,
    button_text: "Start"
  },
  1: {
    message: "Notice how both models identify **sex** as the most important feature. In the decision tree (top), women go down the left path with a 74% survival rate. In the SHAP waterfall (bottom left), being female pushes the prediction strongly toward survival (green bar).",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 1,  // First split
    highlight_features: ["sex"],
    button_text: "Next"
  },
  2: {
    message: "Next, **pclass** (passenger class) further refines the prediction. First class passengers had better survival chances. The tree branches left for 1st class, and the SHAP bar shows this contributes positively.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 2,  // First two splits
    highlight_features: ["sex", "pclass"],
    button_text: "Next"
  },
  3: {
    message: "The model also considers **age**. Younger passengers in 1st class had slightly higher survival rates. See how the tree path and SHAP waterfall show each decision step.",
    whatif_values: TUTORIAL_PASSENGER,
    highlight_mode: 3,  // First three splits
    highlight_features: ["sex", "pclass", "age"],
    button_text: "Next"
  },
  4: {
    message: "Finally, **fare** (ticket price) provides additional detail. Following the complete path through the tree shows a 78% survival probability. The SHAP explanation shows how all four features combine to reach this prediction. Now try exploring other passengers using the preset buttons, chat, or What-If controls!",
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
      if (onAddChatMessage) {
        onAddChatMessage({
          role: 'assistant',
          content: "Tutorial complete! You're ready to explore. Try the preset buttons or ask questions in the chat."
        })
      }
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
