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
      <div className="p-4 rounded-lg" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
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
      <div className="p-4 rounded-lg" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        <p className="text-sm text-red-400">Error loading comparison predictions</p>
      </div>
    )
  }

  // Calculate difference using XGBoost predictions
  const diff = Math.abs(predictionsA.xgboost.probability_survived - predictionsB.xgboost.probability_survived)
  const higherCohort = predictionsA.xgboost.probability_survived > predictionsB.xgboost.probability_survived ? labelA : labelB

  // Get colors for each prediction
  const dtColorsA = getColors(predictionsA.decision_tree.probability_survived)
  const xgbColorsA = getColors(predictionsA.xgboost.probability_survived)
  const dtColorsB = getColors(predictionsB.decision_tree.probability_survived)
  const xgbColorsB = getColors(predictionsB.xgboost.probability_survived)

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: UI_COLORS.cardBg, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
      <p className="mb-3" style={{ fontSize: FONTS.ui.cardLabel, color: UI_COLORS.textPrimary }}>{description}</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Cohort A */}
        <div className="space-y-2">
          <div style={{ fontSize: FONTS.comparison.cohortLabel, color: UI_COLORS.textPrimary, fontWeight: FONT_WEIGHTS.semibold }}>{labelA}</div>

          {/* Decision Tree */}
          <div
            className="p-2 rounded-lg border"
            style={{
              backgroundColor: dtColorsA.bg,
              borderColor: dtColorsA.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>Decision Tree</div>
            <div style={{ fontSize: FONTS.comparison.cardValue, color: dtColorsA.text, fontWeight: FONT_WEIGHTS.bold }}>
              {formatPercentage(predictionsA.decision_tree.probability_survived)}
            </div>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: dtColorsA.text }}>
              {predictionsA.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>

          {/* XGBoost */}
          <div
            className="p-2 rounded-lg border"
            style={{
              backgroundColor: xgbColorsA.bg,
              borderColor: xgbColorsA.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>XGBoost</div>
            <div style={{ fontSize: FONTS.comparison.cardValue, color: xgbColorsA.text, fontWeight: FONT_WEIGHTS.bold }}>
              {formatPercentage(predictionsA.xgboost.probability_survived)}
            </div>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: xgbColorsA.text }}>
              {predictionsA.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>

        {/* Cohort B */}
        <div className="space-y-2">
          <div style={{ fontSize: FONTS.comparison.cohortLabel, color: UI_COLORS.textPrimary, fontWeight: FONT_WEIGHTS.semibold }}>{labelB}</div>

          {/* Decision Tree */}
          <div
            className="p-2 rounded-lg border"
            style={{
              backgroundColor: dtColorsB.bg,
              borderColor: dtColorsB.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>Decision Tree</div>
            <div style={{ fontSize: FONTS.comparison.cardValue, color: dtColorsB.text, fontWeight: FONT_WEIGHTS.bold }}>
              {formatPercentage(predictionsB.decision_tree.probability_survived)}
            </div>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: dtColorsB.text }}>
              {predictionsB.decision_tree.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>

          {/* XGBoost */}
          <div
            className="p-2 rounded-lg border"
            style={{
              backgroundColor: xgbColorsB.bg,
              borderColor: xgbColorsB.border
            }}
          >
            <div className="mb-1" style={{ fontSize: FONTS.comparison.modelLabel, color: UI_COLORS.textSecondary }}>XGBoost</div>
            <div style={{ fontSize: FONTS.comparison.cardValue, color: xgbColorsB.text, fontWeight: FONT_WEIGHTS.bold }}>
              {formatPercentage(predictionsB.xgboost.probability_survived)}
            </div>
            <div className="mt-1 opacity-80" style={{ fontSize: FONTS.comparison.cardOutcome, color: xgbColorsB.text }}>
              {predictionsB.xgboost.prediction === 1 ? 'Survived' : 'Died'}
            </div>
          </div>
        </div>
      </div>

      {/* Difference summary (using XGBoost) */}
      <div className="border-t pt-2" style={{ fontSize: FONTS.comparison.summaryText, color: UI_COLORS.textSecondary, borderColor: UI_COLORS.cardBorder }}>
        <strong>{higherCohort}</strong> had a <strong>{formatPercentage(diff)}</strong> higher survival rate (XGBoost)
      </div>
    </div>
  )
}

export default ComparisonCard
