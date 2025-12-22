import { useState, useEffect } from 'react'

// Initial passenger: 8-year-old female in 1st class, £84 fare
const INITIAL_PASSENGER = {
  sex: 0,
  pclass: 1,
  age: 8,
  fare: 84
}

// Animation step definitions
const ANIMATION_STEPS = [
  {
    highlight_mode: -1,             // No path highlighted (empty)
    highlight_features: null,
    duration: 1500  // Show initial state for 1.5s
  },
  {
    highlight_mode: "first_split",  // Highlight root node + first child (sex split)
    highlight_features: ["sex"],     // Highlight sex feature
    duration: 2000  // Show sex highlight for 2s
  },
  {
    highlight_mode: "full_path",    // Highlight complete path
    highlight_features: ["sex", "pclass", "age", "fare"],  // All features
    duration: 2500  // Show full path for 2.5s
  },
  {
    highlight_mode: "full_path",    // Keep full path visible at end
    highlight_features: ["sex", "pclass", "age", "fare"],
    duration: 0  // End state
  }
]

/**
 * Custom hook to manage initial auto-playing animation
 * Automatically steps through tree path and SHAP features on every page load
 *
 * @returns {Object} Animation state (highlight mode and features)
 */
function useInitialAnimation() {
  const [animationStep, setAnimationStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true) // Start as true so highlighting is controlled from the start

  // Auto-start animation stepping on mount
  useEffect(() => {
    // Animation will start stepping immediately through useEffect below
  }, []) // Empty dependency array - runs only on mount

  // Step through animation automatically
  useEffect(() => {
    if (!isAnimating) return

    const currentStep = ANIMATION_STEPS[animationStep]

    if (!currentStep || animationStep >= ANIMATION_STEPS.length - 1) {
      // Animation complete
      setIsAnimating(false)
      return
    }

    // Move to next step after duration
    const timer = setTimeout(() => {
      setAnimationStep(prev => prev + 1)
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [isAnimating, animationStep])

  /**
   * Get the current highlight mode for the decision tree
   */
  const getHighlightMode = () => {
    return isAnimating ? ANIMATION_STEPS[animationStep]?.highlight_mode || null : null
  }

  /**
   * Get the list of features to highlight in the waterfall chart
   */
  const getHighlightFeatures = () => {
    return isAnimating ? ANIMATION_STEPS[animationStep]?.highlight_features || null : null
  }

  /**
   * Reset animation (for development/testing)
   */
  const resetAnimation = () => {
    setAnimationStep(0)
    setIsAnimating(false)
  }

  return {
    isAnimating,
    getHighlightMode,
    getHighlightFeatures,
    resetAnimation
  }
}

export default useInitialAnimation
