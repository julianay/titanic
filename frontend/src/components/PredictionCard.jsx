import PropTypes from 'prop-types'
import LoadingSpinner from './LoadingSpinner'
import { UI_COLORS, FONT_WEIGHTS, FONTS } from '../utils/uiStyles'

function PredictionCard({ prediction, loading, error, modelName }) {
  // Get colors based on survival probability
  const getColors = (probability) => {
    if (probability > 70) {
      return {
        bg: UI_COLORS.survivedBg,
        border: UI_COLORS.survivedBorder,
        text: UI_COLORS.survivedText
      }
    }
    if (probability >= 40) {
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

  // Loading state
  if (loading) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: UI_COLORS.cardBgLoading, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        <LoadingSpinner message={`Calculating ${modelName} prediction...`} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: UI_COLORS.cardBgError, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorderError }}>
        <p className="font-medium mb-2" style={{ color: UI_COLORS.textErrorTitle }}>{modelName} Error</p>
        <p className="text-sm" style={{ color: UI_COLORS.textError }}>{error.message || 'Failed to get prediction'}</p>
        <p className="text-xs mt-2" style={{ color: UI_COLORS.textMuted }}>
          Make sure the backend is running on port 8000
        </p>
      </div>
    )
  }

  // No data state
  if (!prediction) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: UI_COLORS.cardBgLoading, borderWidth: '1px', borderStyle: 'solid', borderColor: UI_COLORS.cardBorder }}>
        <p className="text-sm text-center" style={{ color: UI_COLORS.textMuted }}>No prediction data available</p>
      </div>
    )
  }

  // Calculate survival probability percentage
  const survivalProbability = Math.round(prediction.probability_survived * 100)
  const survived = prediction.prediction === 1
  const colors = getColors(survivalProbability)
  const outcomeColors = survived ?
    { text: UI_COLORS.survivedText } :
    { text: UI_COLORS.diedText }

  return (
    <div
      className="p-6 border rounded-lg"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border
      }}
    >
      {/* Model Name Header */}
        <div className="text-center mb-4 pb-3 border-b" style={{ borderColor: UI_COLORS.cardBorder }}>
        <p className="uppercase tracking-wider" style={{ fontSize: FONTS.ui.cardSubtext, color: UI_COLORS.textSecondary, fontWeight: FONT_WEIGHTS.semibold }}>
          {modelName}
        </p>
      </div>

      {/* Survival Probability */}
      <div className="text-center mb-4">
        <p className="mb-2" style={{ fontSize: FONTS.ui.cardLabel, color: UI_COLORS.textSecondary }}>Survival Probability</p>
        <p style={{ fontSize: FONTS.ui.cardValue, color: colors.text, fontWeight: FONT_WEIGHTS.bold }}>
          {survivalProbability}%
        </p>
      </div>

      {/* Prediction */}
      <div className="text-center pt-4 border-t" style={{ borderColor: UI_COLORS.cardBorder }}>
        <p className="mb-1" style={{ fontSize: FONTS.ui.cardLabel, color: UI_COLORS.textSecondary }}>Predicted Outcome</p>
        <p style={{ fontSize: FONTS.ui.cardOutcome, color: outcomeColors.text, fontWeight: FONT_WEIGHTS.semibold }}>
          {prediction.prediction_label || (survived ? 'Survived' : 'Died')}
        </p>
      </div>

      {/* Death Probability (subtle) */}
      <div className="text-center mt-3 pt-3 border-t" style={{ borderColor: UI_COLORS.cardBorderDivider }}>
        <p style={{ fontSize: FONTS.ui.cardSubtext, color: UI_COLORS.textMuted }}>
          Death Probability: {Math.round(prediction.probability_died * 100)}%
        </p>
      </div>
    </div>
  )
}

PredictionCard.propTypes = {
  prediction: PropTypes.shape({
    prediction: PropTypes.number.isRequired,
    probability_survived: PropTypes.number.isRequired,
    probability_died: PropTypes.number.isRequired,
    prediction_label: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.object,
  modelName: PropTypes.string.isRequired
}

PredictionCard.defaultProps = {
  prediction: null,
  loading: false,
  error: null
}

export default PredictionCard
