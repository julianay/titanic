import PropTypes from 'prop-types'

function ComparisonSummary({ decisionTreePred, xgboostPred, loading, error }) {
  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg">
        <p className="text-gray-400 text-center">Loading comparison...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
        <p className="text-red-400 font-medium mb-2">Comparison Error</p>
        <p className="text-red-300 text-sm">{error.message}</p>
      </div>
    )
  }

  // No data state
  if (!decisionTreePred || !xgboostPred) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg">
        <p className="text-gray-400 text-center text-sm">
          Waiting for predictions from both models...
        </p>
      </div>
    )
  }

  // Check if models agree
  const modelsAgree = decisionTreePred.prediction === xgboostPred.prediction
  const dtSurvivalProb = Math.round(decisionTreePred.probability_survived * 100)
  const xgbSurvivalProb = Math.round(xgboostPred.probability_survived * 100)
  const probabilityDiff = Math.abs(dtSurvivalProb - xgbSurvivalProb)

  // Determine outcome
  const outcome = decisionTreePred.prediction === 1 ? 'Survived' : 'Died'
  const dtOutcome = decisionTreePred.prediction === 1 ? 'Survived' : 'Died'
  const xgbOutcome = xgboostPred.prediction === 1 ? 'Survived' : 'Died'

  // Agreement/disagreement styling
  const agreementColor = modelsAgree ? 'text-green-400' : 'text-yellow-400'
  const agreementBg = modelsAgree
    ? 'bg-green-900 bg-opacity-20 border-green-700'
    : 'bg-yellow-900 bg-opacity-20 border-yellow-700'

  return (
    <div className={`p-6 border rounded-lg ${agreementBg}`}>
      {/* Header */}
      <div className="text-center mb-4 pb-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-1">Model Comparison</h3>
        <p className="text-xs text-gray-500">Decision Tree vs XGBoost</p>
      </div>

      {/* Agreement Status */}
      <div className="text-center mb-6">
        <p className={`text-2xl font-bold ${agreementColor} mb-2`}>
          {modelsAgree ? '✓ Models Agree' : '⚠ Models Disagree'}
        </p>
        {modelsAgree ? (
          <p className="text-gray-400 text-sm">
            Both models predict: <span className={outcome === 'Survived' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{outcome}</span>
          </p>
        ) : (
          <div className="text-gray-400 text-sm space-y-1">
            <p>Decision Tree: <span className={dtOutcome === 'Survived' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{dtOutcome}</span></p>
            <p>XGBoost: <span className={xgbOutcome === 'Survived' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{xgbOutcome}</span></p>
          </div>
        )}
      </div>

      {/* Probability Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-800 bg-opacity-50 rounded">
          <p className="text-xs text-gray-500 mb-1">Decision Tree</p>
          <p className="text-2xl font-bold text-blue-400">{dtSurvivalProb}%</p>
          <p className="text-xs text-gray-600 mt-1">survival</p>
        </div>
        <div className="text-center p-3 bg-gray-800 bg-opacity-50 rounded">
          <p className="text-xs text-gray-500 mb-1">XGBoost</p>
          <p className="text-2xl font-bold text-purple-400">{xgbSurvivalProb}%</p>
          <p className="text-xs text-gray-600 mt-1">survival</p>
        </div>
      </div>

      {/* Probability Difference */}
      <div className="text-center pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 mb-1">Probability Difference</p>
        <p className="text-xl font-semibold text-gray-300">
          {probabilityDiff}%
        </p>
        {probabilityDiff > 20 && (
          <p className="text-xs text-yellow-500 mt-2">
            Large difference - models have significantly different confidence
          </p>
        )}
        {probabilityDiff <= 5 && modelsAgree && (
          <p className="text-xs text-green-500 mt-2">
            Very close agreement - high confidence
          </p>
        )}
      </div>

      {/* Interpretation */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          {modelsAgree
            ? 'Both models analyzed the passenger features and reached the same conclusion.'
            : 'Models weighted features differently, leading to different predictions. Check SHAP values to understand why.'}
        </p>
      </div>
    </div>
  )
}

ComparisonSummary.propTypes = {
  decisionTreePred: PropTypes.shape({
    prediction: PropTypes.number.isRequired,
    probability_survived: PropTypes.number.isRequired,
    probability_died: PropTypes.number.isRequired,
    prediction_label: PropTypes.string
  }),
  xgboostPred: PropTypes.shape({
    prediction: PropTypes.number.isRequired,
    probability_survived: PropTypes.number.isRequired,
    probability_died: PropTypes.number.isRequired,
    prediction_label: PropTypes.string
  }),
  loading: PropTypes.bool,
  error: PropTypes.object
}

ComparisonSummary.defaultProps = {
  decisionTreePred: null,
  xgboostPred: null,
  loading: false,
  error: null
}

export default ComparisonSummary
