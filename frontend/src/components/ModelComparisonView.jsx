import useFetchTree from '../hooks/useFetchTree'
import usePredictBoth from '../hooks/usePredictBoth'
import useSHAPExplanation from '../hooks/useSHAPExplanation'
import useGlobalImportance from '../hooks/useGlobalImportance'
import DecisionTreeViz from './visualizations/DecisionTreeViz'
import SHAPWaterfall from './visualizations/SHAPWaterfall'
import GlobalFeatureImportance from './visualizations/GlobalFeatureImportance'
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

  // Fetch SHAP data for both cohorts when in comparison mode
  const { data: shapDataA, loading: shapLoadingA } = useSHAPExplanation(
    activeComparison?.cohortA || passengerData
  )
  const { data: shapDataB, loading: shapLoadingB } = useSHAPExplanation(
    activeComparison?.cohortB || passengerData
  )

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
                passengerValues={hasQuery || highlightMode ? passengerData : null}
                highlightMode={highlightMode}
                comparisonData={hasQuery ? activeComparison : null}
              />
            </div>
          ) : (
            <LoadingSkeleton variant="tree" className="mb-6" />
          )}
        </ErrorBoundary>
      </section>

      {/* XGBoost SHAP Section */}
      <section className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-2">XGBoost (SHAP) Explanation</h2>
          <p className="text-sm text-gray-400">
            Shows how each feature contributes to the prediction
          </p>
        </div>

        {/* Comparison Mode: Show 2 Waterfall Charts */}
        {activeComparison && hasQuery ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Cohort A Waterfall */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-400 mb-3">{activeComparison.labelA}</h3>
                <ErrorBoundary errorTitle="SHAP Waterfall Error (Cohort A)">
                  {shapLoadingA ? (
                    <LoadingSkeleton variant="chart" />
                  ) : shapDataA ? (
                    <SHAPWaterfall
                      waterfallData={shapDataA.waterfall_data}
                      baseValue={shapDataA.base_value}
                      finalPrediction={shapDataA.final_prediction}
                      highlightFeatures={highlightFeatures}
                    />
                  ) : (
                    <LoadingSkeleton variant="chart" />
                  )}
                </ErrorBoundary>
              </div>

              {/* Cohort B Waterfall */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-orange-400 mb-3">{activeComparison.labelB}</h3>
                <ErrorBoundary errorTitle="SHAP Waterfall Error (Cohort B)">
                  {shapLoadingB ? (
                    <LoadingSkeleton variant="chart" />
                  ) : shapDataB ? (
                    <SHAPWaterfall
                      waterfallData={shapDataB.waterfall_data}
                      baseValue={shapDataB.base_value}
                      finalPrediction={shapDataB.final_prediction}
                      highlightFeatures={highlightFeatures}
                    />
                  ) : (
                    <LoadingSkeleton variant="chart" />
                  )}
                </ErrorBoundary>
              </div>
            </div>

            {/* Global Feature Importance (below waterfalls in comparison mode) */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Global Feature Importance</h3>
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
          </>
        ) : (
          /* Single Mode: Show 1 Waterfall + Global Importance side-by-side */
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
