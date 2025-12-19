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

  const getColorClass = (probability) => {
    if (probability >= 0.7) return 'bg-green-900/30 border-green-500/50 text-green-300'
    if (probability >= 0.4) return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300'
    return 'bg-red-900/30 border-red-500/50 text-red-300'
  }

  const formatPercentage = (prob) => `${Math.round(prob * 100)}%`

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

  if (!predictionsA || !predictionsB || !predictionsA.xgboost || !predictionsB.xgboost) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-sm text-red-400">Error loading comparison predictions</p>
      </div>
    )
  }

  // Calculate difference using XGBoost predictions
  const diff = Math.abs(predictionsA.xgboost.probability_survived - predictionsB.xgboost.probability_survived)
  const higherCohort = predictionsA.xgboost.probability_survived > predictionsB.xgboost.probability_survived ? labelA : labelB

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <p className="text-sm text-gray-300 mb-3">{description}</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Cohort A */}
        <div className="space-y-2">
          <div className="font-semibold text-sm text-gray-300">{labelA}</div>

          {/* Decision Tree */}
          <div className={`p-2 rounded-lg border ${getColorClass(predictionsA.decision_tree.probability_survived)}`}>
            <div className="text-xs text-gray-400 mb-1">Decision Tree</div>
            <div className="text-xl font-bold">{formatPercentage(predictionsA.decision_tree.probability_survived)}</div>
            <div className="text-xs mt-1 opacity-80">
              {predictionsA.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>

          {/* XGBoost */}
          <div className={`p-2 rounded-lg border ${getColorClass(predictionsA.xgboost.probability_survived)}`}>
            <div className="text-xs text-gray-400 mb-1">XGBoost</div>
            <div className="text-xl font-bold">{formatPercentage(predictionsA.xgboost.probability_survived)}</div>
            <div className="text-xs mt-1 opacity-80">
              {predictionsA.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>

        {/* Cohort B */}
        <div className="space-y-2">
          <div className="font-semibold text-sm text-gray-300">{labelB}</div>

          {/* Decision Tree */}
          <div className={`p-2 rounded-lg border ${getColorClass(predictionsB.decision_tree.probability_survived)}`}>
            <div className="text-xs text-gray-400 mb-1">Decision Tree</div>
            <div className="text-xl font-bold">{formatPercentage(predictionsB.decision_tree.probability_survived)}</div>
            <div className="text-xs mt-1 opacity-80">
              {predictionsB.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>

          {/* XGBoost */}
          <div className={`p-2 rounded-lg border ${getColorClass(predictionsB.xgboost.probability_survived)}`}>
            <div className="text-xs text-gray-400 mb-1">XGBoost</div>
            <div className="text-xl font-bold">{formatPercentage(predictionsB.xgboost.probability_survived)}</div>
            <div className="text-xs mt-1 opacity-80">
              {predictionsB.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>
      </div>

      {/* Difference summary (using XGBoost) */}
      <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
        <strong>{higherCohort}</strong> had a <strong>{formatPercentage(diff)}</strong> higher survival rate (XGBoost)
      </div>
    </div>
  )
}

export default ComparisonCard
