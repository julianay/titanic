import { useEffect, useState } from 'react'
import { UI_COLORS, FONT_WEIGHTS, FONTS } from '../utils/uiStyles'

/**
 * ComparisonCard - Shows side-by-side survival predictions for two cohorts
 *
 * @param {Object} cohortA - First cohort passenger data {sex, pclass, age, fare}
 * @param {Object} cohortB - Second cohort passenger data
 * @param {string} labelA - Label for first cohort (e.g., "Women")
 * @param {string} labelB - Label for second cohort (e.g., "Men")
 * @param {string} description - Description of the comparison
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {Function} onHighlightCohort - Callback when percentage clicked to highlight cohort: (cohortData, comparisonData?, messageIndex?) => void
 * @param {number} messageIndex - Index of this message in the chat messages array
 */
function ComparisonCard({ cohortA, cohortB, labelA, labelB, description, onEdit, onHighlightCohort, messageIndex }) {
  // Construct comparison object to pass when highlighting a cohort
  const comparisonData = {
    isComparison: true,
    cohortA,
    cohortB,
    labelA,
    labelB,
    description
  }
  const [predictionsA, setPredictionsA] = useState(null)
  const [predictionsB, setPredictionsB] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true)
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
        // Fetch both predictions in parallel
        const [responseA, responseB] = await Promise.all([
          fetch(`${apiUrl}/api/predict/both`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cohortA)
          }),
          fetch(`${apiUrl}/api/predict/both`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cohortB)
          })
        ])

        const dataA = await responseA.json()
        const dataB = await responseB.json()

        setPredictionsA(dataA) // Store both decision_tree and xgboost
        setPredictionsB(dataB)
      } catch (error) {
        console.error('Error fetching comparison predictions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [cohortA, cohortB])

  const getColors = (probability) => {
    if (probability >= 0.7) {
      return {
        bg: UI_COLORS.survivedBg,
        border: UI_COLORS.survivedBorder,
        text: UI_COLORS.survivedText
      }
    }
    if (probability >= 0.4) {
      return {
        bg: UI_COLORS.uncertainBg,
        border: UI_COLORS.uncertainBorder,
        text: UI_COLORS.uncertainText
      }
    }
    return {
      bg: UI_COLORS.diedBg,
      border: UI_COLORS.diedBorder,
      text: UI_COLORS.diedText
    }
  }

  const formatPercentage = (prob) => `${Math.round(prob * 100)}%`

  if (loading) {
    return (
      <div className="p-0 rounded-lg relative" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        {/* Sparkle icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 absolute"
          style={{ color: UI_COLORS.chatIconColor, top: '8px', left: '8px' }}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
        </svg>
        <div className="flex gap-0" style={{ paddingLeft: 'px' }}>
          <div className="flex-1 h-24 bg-gray-700 rounded animate-pulse" />
          <div className="flex-1 h-24 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!predictionsA || !predictionsB || !predictionsA.xgboost || !predictionsB.xgboost) {
    return (
      <div className="p-2 rounded-lg relative" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        {/* Sparkle icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 absolute"
          style={{ color: UI_COLORS.chatIconColor, top: '8px', left: '8px' }}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-red-400" style={{ paddingLeft: '28px' }}>Error loading comparison predictions</p>
      </div>
    )
  }

  // Get colors for each prediction
  const dtColorsA = getColors(predictionsA.decision_tree.probability_survived)
  const xgbColorsA = getColors(predictionsA.xgboost.probability_survived)
  const dtColorsB = getColors(predictionsB.decision_tree.probability_survived)
  const xgbColorsB = getColors(predictionsB.xgboost.probability_survived)

  return (
    <div className="p-2 rounded-lg relative" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
      {/* Sparkle icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 absolute"
        style={{ color: UI_COLORS.chatIconColor, top: '8px', left: '8px' }}
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
      </svg>
      <div className="grid grid-cols-2 gap-0" style={{ paddingLeft: '28px' }}>
        {/* Cohort A */}
        <div className="space-y-1">
          <div style={{ fontSize: FONTS.comparison.cohortLabel, color: UI_COLORS.textPrimary, fontWeight: FONT_WEIGHTS.semibold }}>{labelA}</div>

          {/* Decision Tree */}
          <div
            className="p-0 rounded-lg border"
            style={{
              backgroundColor: dtColorsA.bg,
              borderColor: dtColorsA.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>Decision Tree</div>
            <button
              onClick={onHighlightCohort ? () => onHighlightCohort(cohortA, comparisonData, messageIndex) : undefined}
              className={onHighlightCohort ? "hover:underline cursor-pointer" : ""}
              style={{ fontSize: FONTS.comparison.cardValue, color: dtColorsA.text, fontWeight: FONT_WEIGHTS.bold, background: 'none', border: 'none', padding: 0 }}
            >
              {formatPercentage(predictionsA.decision_tree.probability_survived)}
            </button>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: dtColorsA.text }}>
              {predictionsA.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>

          {/* XGBoost */}
          <div
            className="p-0 rounded-lg border"
            style={{
              backgroundColor: xgbColorsA.bg,
              borderColor: xgbColorsA.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>XGBoost</div>
            <button
              onClick={onHighlightCohort ? () => onHighlightCohort(cohortA, comparisonData, messageIndex) : undefined}
              className={onHighlightCohort ? "hover:underline cursor-pointer" : ""}
              style={{ fontSize: FONTS.comparison.cardValue, color: xgbColorsA.text, fontWeight: FONT_WEIGHTS.bold, background: 'none', border: 'none', padding: 0 }}
            >
              {formatPercentage(predictionsA.xgboost.probability_survived)}
            </button>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: xgbColorsA.text }}>
              {predictionsA.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>

        {/* Cohort B */}
        <div className="space-y-1">
          <div style={{ fontSize: FONTS.comparison.cohortLabel, color: UI_COLORS.textPrimary, fontWeight: FONT_WEIGHTS.semibold }}>{labelB}</div>

          {/* Decision Tree */}
          <div
            className="p-0 rounded-lg border"
            style={{
              backgroundColor: dtColorsB.bg,
              borderColor: dtColorsB.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>Decision Tree</div>
            <button
              onClick={onHighlightCohort ? () => onHighlightCohort(cohortB, comparisonData, messageIndex) : undefined}
              className={onHighlightCohort ? "hover:underline cursor-pointer" : ""}
              style={{ fontSize: FONTS.comparison.cardValue, color: dtColorsB.text, fontWeight: FONT_WEIGHTS.bold, background: 'none', border: 'none', padding: 0 }}
            >
              {formatPercentage(predictionsB.decision_tree.probability_survived)}
            </button>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: dtColorsB.text }}>
              {predictionsB.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>

          {/* XGBoost */}
          <div
            className="p-0 rounded-lg border"
            style={{
              backgroundColor: xgbColorsB.bg,
              borderColor: xgbColorsB.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>XGBoost</div>
            <button
              onClick={onHighlightCohort ? () => onHighlightCohort(cohortB, comparisonData, messageIndex) : undefined}
              className={onHighlightCohort ? "hover:underline cursor-pointer" : ""}
              style={{ fontSize: FONTS.comparison.cardValue, color: xgbColorsB.text, fontWeight: FONT_WEIGHTS.bold, background: 'none', border: 'none', padding: 0 }}
            >
              {formatPercentage(predictionsB.xgboost.probability_survived)}
            </button>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: xgbColorsB.text }}>
              {predictionsB.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit link */}
      {onEdit && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs hover:underline"
            style={{ color: UI_COLORS.linkColor }}
          >
            edit cohort
          </button>
        </div>
      )}
    </div>
  )
}

export default ComparisonCard
