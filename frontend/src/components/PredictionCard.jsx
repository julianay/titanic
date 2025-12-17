import PropTypes from 'prop-types'
import LoadingSpinner from './LoadingSpinner'

function PredictionCard({ prediction, loading, error, modelName }) {
  // Get background color based on survival probability
  const getBackgroundColor = (probability) => {
    if (probability > 70) return 'bg-green-900 bg-opacity-30 border-green-700'
    if (probability >= 40) return 'bg-yellow-900 bg-opacity-30 border-yellow-700'
    return 'bg-red-900 bg-opacity-30 border-red-700'
  }

  // Get text color based on survival probability
  const getTextColor = (probability) => {
    if (probability > 70) return 'text-green-400'
    if (probability >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg">
        <LoadingSpinner message={`Calculating ${modelName} prediction...`} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
        <p className="text-red-400 font-medium mb-2">{modelName} Error</p>
        <p className="text-red-300 text-sm">{error.message || 'Failed to get prediction'}</p>
        <p className="text-gray-400 text-xs mt-2">
          Make sure the backend is running on port 8000
        </p>
      </div>
    )
  }

  // No data state
  if (!prediction) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg">
        <p className="text-gray-400 text-sm text-center">No prediction data available</p>
      </div>
    )
  }

  // Calculate survival probability percentage
  const survivalProbability = Math.round(prediction.probability_survived * 100)
  const survived = prediction.prediction === 1

  return (
    <div className={`p-6 border rounded-lg ${getBackgroundColor(survivalProbability)}`}>
      {/* Model Name Header */}
      <div className="text-center mb-4 pb-3 border-b border-gray-700">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          {modelName}
        </p>
      </div>

      {/* Survival Probability */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-400 mb-2">Survival Probability</p>
        <p className={`text-5xl font-bold ${getTextColor(survivalProbability)}`}>
          {survivalProbability}%
        </p>
      </div>

      {/* Prediction */}
      <div className="text-center pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-1">Predicted Outcome</p>
        <p className={`text-2xl font-semibold ${survived ? 'text-green-400' : 'text-red-400'}`}>
          {prediction.prediction_label || (survived ? 'Survived' : 'Died')}
        </p>
      </div>

      {/* Death Probability (subtle) */}
      <div className="text-center mt-3 pt-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
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
