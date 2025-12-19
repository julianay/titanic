import useFetchTree from '../hooks/useFetchTree'
import usePredictBoth from '../hooks/usePredictBoth'
import useSHAPExplanation from '../hooks/useSHAPExplanation'
import useGlobalImportance from '../hooks/useGlobalImportance'
import DecisionTreeViz from './visualizations/DecisionTreeViz'
import SHAPWaterfall from './visualizations/SHAPWaterfall'
import GlobalFeatureImportance from './visualizations/GlobalFeatureImportance'
import PredictionCard from './PredictionCard'
import ComparisonSummary from './ComparisonSummary'
import LoadingSkeleton from './LoadingSkeleton'
import ErrorBoundary from './ErrorBoundary'

/**
 * ModelComparisonView - Unified view showing both Decision Tree and XGBoost explanations
 *
 * @param {Object} passengerData - Current passenger values
 * @param {string|number} highlightMode - Tutorial highlight mode for decision tree
 * @param {Array<string>} highlightFeatures - Tutorial features to highlight in SHAP
 * @param {Object} activeComparison - Active comparison data (cohortA, cohortB) or null
 * @param {boolean} hasQuery - Whether user has made a query (hides predictions on first load)
 */
function ModelComparisonView({ passengerData, highlightMode = null, highlightFeatures = null, activeComparison = null, hasQuery = false }) {
  const { data: treeData, loading: treeLoading } = useFetchTree()
  const { data: predictions, loading: predictionsLoading, error: predictionsError } = usePredictBoth(passengerData)
  const { data: shapData, loading: shapLoading } = useSHAPExplanation(passengerData)
  const { data: globalImportance, loading: globalLoading } = useGlobalImportance()

  if (treeLoading) {
    return (
      <div className="space-y-8 w-full">
        <LoadingSkeleton variant="tree" />
        <LoadingSkeleton variant="card" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Decision Tree Section */}
      <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Decision Tree Explanation</h2>
          <p className="text-sm text-gray-400">
            Shows the decision path through the tree based on passenger characteristics
          </p>
        </div>

        <ErrorBoundary errorTitle="Decision Tree Visualization Error">
          {treeData ? (
            <div className="mb-6">
              <DecisionTreeViz
                treeData={treeData.tree}
                passengerValues={hasQuery ? passengerData : null}
                highlightMode={highlightMode}
                comparisonData={hasQuery ? activeComparison : null}
              />
            </div>
          ) : (
            <LoadingSkeleton variant="tree" className="mb-6" />
          )}
        </ErrorBoundary>

        {/* Decision Tree Prediction Card */}
        {hasQuery ? (
          <PredictionCard
            prediction={predictions?.decision_tree}
            loading={predictionsLoading}
            error={predictionsError}
            modelName="Decision Tree"
          />
        ) : (
          <div className="p-6 bg-gray-800 bg-opacity-30 border border-gray-700 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Make a query in the chat to see predictions</p>
          </div>
        )}
      </section>

      {/* XGBoost SHAP Section */}
      <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-2">XGBoost (SHAP) Explanation</h2>
          <p className="text-sm text-gray-400">
            Shows how each feature contributes to the prediction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SHAP Waterfall */}
          <div className="bg-gray-900 rounded-lg p-4">
            <ErrorBoundary errorTitle="SHAP Waterfall Error">
              {shapLoading ? (
                <LoadingSkeleton variant="chart" />
              ) : shapData ? (
                <SHAPWaterfall
                  waterfallData={shapData.waterfall_data}
                  baseValue={shapData.base_value}
                  finalPrediction={shapData.final_prediction}
                  highlightFeatures={highlightFeatures}
                />
              ) : (
                <LoadingSkeleton variant="chart" />
              )}
            </ErrorBoundary>
          </div>

          {/* Global Feature Importance */}
          <div className="bg-gray-900 rounded-lg p-4">
            <ErrorBoundary errorTitle="Feature Importance Error">
              {globalLoading ? (
                <LoadingSkeleton variant="chart" />
              ) : globalImportance?.feature_importance ? (
                <GlobalFeatureImportance
                  data={globalImportance.feature_importance.map(item => ({
                    feature: item.feature,
                    value: item.importance
                  }))}
                />
              ) : (
                <LoadingSkeleton variant="chart" />
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* XGBoost Prediction Card */}
        {hasQuery ? (
          <PredictionCard
            prediction={predictions?.xgboost}
            loading={predictionsLoading}
            error={predictionsError}
            modelName="XGBoost"
          />
        ) : (
          <div className="p-6 bg-gray-800 bg-opacity-30 border border-gray-700 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Make a query in the chat to see predictions</p>
          </div>
        )}
      </section>

      {/* Model Comparison Summary */}
      <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <ErrorBoundary errorTitle="Comparison Error">
          <ComparisonSummary
            decisionTreePred={predictions?.decision_tree}
            xgboostPred={predictions?.xgboost}
            loading={predictionsLoading}
            error={predictionsError}
          />
        </ErrorBoundary>
      </section>
    </div>
  )
}

export default ModelComparisonView
