import { useEffect, useState } from 'react'
import { UI_COLORS, FONT_WEIGHTS, FONTS } from '../utils/uiStyles'

/**
 * SinglePredictionCard - Shows survival predictions for a single passenger in chat
 *
 * @param {Object} passengerData - Passenger data {sex, pclass, age, fare}
 * @param {string} label - Label for the passenger (e.g., "30-year-old female in 2nd class")
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {Function} onHighlightCohort - Callback when percentage is clicked to highlight path
 * @param {number} messageIndex - Index of this message in the chat messages array
 */
function SinglePredictionCard({ passengerData, label, onEdit, onHighlightCohort, messageIndex }) {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true)
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin
        const response = await fetch(`${apiUrl}/api/predict/both`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(passengerData)
        })

        const data = await response.json()
        setPredictions(data) // Store both decision_tree and xgboost
      } catch (error) {
        console.error('Error fetching prediction:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [passengerData])

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
      <div className="p-4 rounded-lg relative" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        {/* Sparkle icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 absolute"
          style={{ color: UI_COLORS.chatIconColor, top: '16px', left: '16px' }}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-gray-400" style={{ paddingLeft: '28px' }}>{label}</p>
        <div className="mt-3 grid grid-cols-2 gap-3" style={{ paddingLeft: '28px' }}>
          <div className="h-32 bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!predictions || !predictions.decision_tree || !predictions.xgboost) {
    return (
      <div className="p-4 rounded-lg relative" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        {/* Sparkle icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 absolute"
          style={{ color: UI_COLORS.chatIconColor, top: '16px', left: '16px' }}
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-red-400" style={{ paddingLeft: '28px' }}>Error loading prediction</p>
      </div>
    )
  }

  const dtColors = getColors(predictions.decision_tree.probability_survived)
  const xgbColors = getColors(predictions.xgboost.probability_survived)

  return (
    <div className="p-4 rounded-lg relative" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
      {/* Sparkle icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5 absolute"
        style={{ color: UI_COLORS.chatIconColor, top: '16px', left: '16px' }}
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
      </svg>
      <p className="mb-3" style={{ fontSize: FONTS.ui.cardLabel, color: UI_COLORS.textSecondary, fontWeight: FONT_WEIGHTS.normal, paddingLeft: '28px' }}>{label}</p>

      <div className="grid grid-cols-2 gap-3" style={{ paddingLeft: '28px' }}>
        {/* Decision Tree */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: dtColors.bg,
            borderColor: dtColors.border
          }}
        >
          <div>
            <div className="mb-2" style={{ fontSize: FONTS.ui.cardSubtext, color: UI_COLORS.textSecondary }}>Decision Tree</div>
            <button
              onClick={onHighlightCohort ? () => onHighlightCohort(passengerData, null, messageIndex) : undefined}
              className={onHighlightCohort ? "mb-2 hover:underline cursor-pointer" : "mb-2"}
              style={{ fontSize: FONTS.ui.cardValueMedium, color: dtColors.text, fontWeight: FONT_WEIGHTS.bold, background: 'none', border: 'none', padding: 0 }}
            >
              {formatPercentage(predictions.decision_tree.probability_survived)}
            </button>
            <div style={{ fontSize: FONTS.ui.cardLabel, color: dtColors.text, fontWeight: FONT_WEIGHTS.semibold }}>
              {predictions.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>

        {/* XGBoost */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: xgbColors.bg,
            borderColor: xgbColors.border
          }}
        >
          <div>
            <div className="mb-2" style={{ fontSize: FONTS.ui.cardSubtext, color: UI_COLORS.textSecondary }}>XGBoost</div>
            <button
              onClick={onHighlightCohort ? () => onHighlightCohort(passengerData, null, messageIndex) : undefined}
              className={onHighlightCohort ? "mb-2 hover:underline cursor-pointer" : "mb-2"}
              style={{ fontSize: FONTS.ui.cardValueMedium, color: xgbColors.text, fontWeight: FONT_WEIGHTS.bold, background: 'none', border: 'none', padding: 0 }}
            >
              {formatPercentage(predictions.xgboost.probability_survived)}
            </button>
            <div style={{ fontSize: FONTS.ui.cardLabel, color: xgbColors.text, fontWeight: FONT_WEIGHTS.semibold }}>
              {predictions.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>
      </div>

      {/* Edit link */}
      {onEdit && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-sm hover:underline"
            style={{ color: UI_COLORS.linkColor }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            Edit cohort
          </button>
        </div>
      )}
    </div>
  )
}

export default SinglePredictionCard
