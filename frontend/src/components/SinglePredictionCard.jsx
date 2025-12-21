import { useEffect, useState } from 'react'
import { UI_COLORS } from '../utils/visualizationStyles'

/**
 * SinglePredictionCard - Shows survival predictions for a single passenger in chat
 *
 * @param {Object} passengerData - Passenger data {sex, pclass, age, fare}
 * @param {string} label - Label for the passenger (e.g., "30-year-old female in 2nd class")
 */
function SinglePredictionCard({ passengerData, label }) {
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
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">{label}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="h-32 bg-gray-700 rounded animate-pulse" />
          <div className="h-32 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!predictions || !predictions.decision_tree || !predictions.xgboost) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-red-400">Error loading prediction</p>
      </div>
    )
  }

  const dtColors = getColors(predictions.decision_tree.probability_survived)
  const xgbColors = getColors(predictions.xgboost.probability_survived)

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-sm mb-3" style={{ color: UI_COLORS.textSecondary }}>{label}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Decision Tree */}
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: dtColors.bg,
            borderColor: dtColors.border
          }}
        >
          <div className="text-center">
            <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: UI_COLORS.textSecondary }}>Decision Tree</div>
            <div className="text-3xl font-bold mb-2" style={{ color: dtColors.text }}>
              {formatPercentage(predictions.decision_tree.probability_survived)}
            </div>
            <div className="text-sm font-semibold" style={{ color: dtColors.text }}>
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
          <div className="text-center">
            <div className="text-xs mb-2 uppercase tracking-wider" style={{ color: UI_COLORS.textSecondary }}>XGBoost</div>
            <div className="text-3xl font-bold mb-2" style={{ color: xgbColors.text }}>
              {formatPercentage(predictions.xgboost.probability_survived)}
            </div>
            <div className="text-sm font-semibold" style={{ color: xgbColors.text }}>
              {predictions.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SinglePredictionCard
