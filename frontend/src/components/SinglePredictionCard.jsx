import { useEffect, useState } from 'react'

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

  const getColorClass = (probability) => {
    if (probability >= 0.7) return 'bg-green-900/30 border-green-500/50 text-green-300'
    if (probability >= 0.4) return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300'
    return 'bg-red-900/30 border-red-500/50 text-red-300'
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

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-sm text-gray-400 mb-3">{label}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Decision Tree */}
        <div className={`p-3 rounded-lg border ${getColorClass(predictions.decision_tree.probability_survived)}`}>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Decision Tree</div>
            <div className="text-3xl font-bold mb-2">{formatPercentage(predictions.decision_tree.probability_survived)}</div>
            <div className="text-sm font-semibold">
              {predictions.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>

        {/* XGBoost */}
        <div className={`p-3 rounded-lg border ${getColorClass(predictions.xgboost.probability_survived)}`}>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">XGBoost</div>
            <div className="text-3xl font-bold mb-2">{formatPercentage(predictions.xgboost.probability_survived)}</div>
            <div className="text-sm font-semibold">
              {predictions.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SinglePredictionCard
