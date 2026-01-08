import { useState, useEffect } from 'react'

// Animation step definitions - Progressive highlighting of tree path and SHAP bars
const ANIMATION_STEPS = [
  {
    highlight_mode: -1,             // No path highlighted (empty)
    highlight_features: null,
    duration: 0  // No wait - start immediately
  },
  {
    highlight_mode: 1,              // Highlight root + first split
    highlight_features: ["sex"],    // Highlight first feature bar
    duration: 500
  },
  {
    highlight_mode: 2,              // Highlight root + first two splits
    highlight_features: ["sex", "pclass"],  // Highlight first two feature bars
    duration: 500
  },
  {
    highlight_mode: 3,              // Highlight root + first three splits
    highlight_features: ["sex", "pclass", "age"],  // Highlight first three feature bars
    duration: 500
  },
  {
    highlight_mode: 4,              // Highlight root + all four splits
    highlight_features: ["sex", "pclass", "age", "fare"],  // Highlight all four feature bars
    duration: 500
  },
  {
    highlight_mode: "full_path",    // Keep full path visible at end
    highlight_features: ["sex", "pclass", "age", "fare"],
    duration: 0  // End state
  }
]

/**
 * Custom hook to manage replay animation when user clicks on chat card values
 * Plays the same progressive animation as initial load/tutorial
 *
 * @returns {Object} Animation state and trigger function
 */
function useReplayAnimation() {
  const [animationStep, setAnimationStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Step through animation automatically when triggered
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
   * Trigger the replay animation (called when user clicks on percentage)
   */
  const triggerReplay = () => {
    setAnimationStep(0)
    setIsAnimating(true)
  }

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

  return {
    isAnimating,
    triggerReplay,
    getHighlightMode,
    getHighlightFeatures
  }
}

export default useReplayAnimation
