import { useEffect, useState } from 'react'

/**
 * ComparisonCard - Shows side-by-side survival predictions for two cohorts
 *
 * @param {Object} cohortA - First cohort passenger data {sex, pclass, age, fare}
 * @param {Object} cohortB - Second cohort passenger data
 * @param {string} labelA - Label for first cohort (e.g., "Women")
 * @param {string} labelB - Label for second cohort (e.g., "Men")
 * @param {string} description - Description of the comparison
 */
function ComparisonCard({ cohortA, cohortB, labelA, labelB, description }) {
  const [predictionA, setPredictionA] = useState(null)
  const [predictionB, setPredictionB] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true)
      try {
        // Fetch both predictions in parallel
        const [responseA, responseB] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/predict/both`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cohortA)
          }),
          fetch(`${import.meta.env.VITE_API_URL || ''}/api/predict/both`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cohortB)
          })
        ])

        const dataA = await responseA.json()
        const dataB = await responseB.json()

        setPredictionA(dataA.xgboost) // Use XGBoost predictions
        setPredictionB(dataB.xgboost)
      } catch (error) {
        console.error('Error fetching comparison predictions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [cohortA, cohortB])

  const getColorClass = (probability) => {
    if (probability >= 0.7) return 'bg-green-900/30 border-green-500/50 text-green-300'
    if (probability >= 0.4) return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300'
    return 'bg-red-900/30 border-red-500/50 text-red-300'
  }

  const formatPercentage = (prob) => `${(prob * 100).toFixed(1)}%`

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400">{description}</p>
        <div className="mt-3 flex gap-3">
          <div className="flex-1 h-24 bg-gray-700 rounded animate-pulse" />
          <div className="flex-1 h-24 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!predictionA || !predictionB) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-red-400">Error loading comparison predictions</p>
      </div>
    )
  }

  const diff = Math.abs(predictionA.probability_survived - predictionB.probability_survived)
  const higherCohort = predictionA.probability_survived > predictionB.probability_survived ? labelA : labelB

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-sm text-gray-300 mb-3">{description}</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Cohort A */}
        <div className={`p-3 rounded-lg border ${getColorClass(predictionA.probability_survived)}`}>
          <div className="font-semibold text-sm mb-1">{labelA}</div>
          <div className="text-2xl font-bold">{formatPercentage(predictionA.probability_survived)}</div>
          <div className="text-xs mt-1 opacity-80">
            {predictionA.prediction === 1 ? 'Survived' : 'Died'}
          </div>
        </div>

        {/* Cohort B */}
        <div className={`p-3 rounded-lg border ${getColorClass(predictionB.probability_survived)}`}>
          <div className="font-semibold text-sm mb-1">{labelB}</div>
          <div className="text-2xl font-bold">{formatPercentage(predictionB.probability_survived)}</div>
          <div className="text-xs mt-1 opacity-80">
            {predictionB.prediction === 1 ? 'Survived' : 'Died'}
          </div>
        </div>
      </div>

      {/* Difference summary */}
      <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
        <strong>{higherCohort}</strong> had a <strong>{formatPercentage(diff)}</strong> higher survival rate
      </div>
    </div>
  )
}

export default ComparisonCard
