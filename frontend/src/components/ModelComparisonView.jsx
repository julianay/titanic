import useFetchTree from '../hooks/useFetchTree'
import usePredictBoth from '../hooks/usePredictBoth'
import useSHAPExplanation from '../hooks/useSHAPExplanation'
import useGlobalImportance from '../hooks/useGlobalImportance'
import DecisionTreeVizHorizontal from './visualizations/DecisionTreeVizHorizontal'
import SHAPWaterfall from './visualizations/SHAPWaterfall'
import GlobalFeatureImportance from './visualizations/GlobalFeatureImportance'
import ComparisonSummary from './ComparisonSummary'
import LoadingSkeleton from './LoadingSkeleton'
import ErrorBoundary from './ErrorBoundary'
import { UI_COLORS } from '../utils/uiStyles'
import { formatPassengerDescription } from '../utils/cohortPatterns'

/**
 * ModelComparisonView - Vertical layout with horizontal tree
 *
 * Layout:
 * - Decision Tree on top (full width, horizontal left-to-right orientation)
 * - XGBoost visualizations below in one row:
 *   - No comparison: 2 cards side-by-side (waterfall + global)
 *   - Comparison: 2 comparison waterfalls side-by-side, global underneath
 *
 * @param {Object} passengerData - Current passenger values
 * @param {string|number} highlightMode - Tutorial highlight mode for decision tree
 * @param {Array<string>} highlightFeatures - Tutorial features to highlight in SHAP
 * @param {Object} activeComparison - Active comparison data (cohortA, cohortB) or null
 * @param {boolean} hasQuery - Whether user has made a query (hides predictions on first load)
 * @param {Function} onEditClick - Callback when Edit link is clicked
 */
function ModelComparisonView({ passengerData, highlightMode = null, highlightFeatures = null, activeComparison = null, hasQuery = false, onEditClick = null }) {
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
      {/* Current Cohort Display */}
      <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: UI_COLORS.textPrimary }}>
        <span>
          Showing: {activeComparison && hasQuery ? (
            <>
              <span style={{ color: '#60a5fa' }}>{activeComparison.labelA}</span>
              {' vs '}
              <span style={{ color: '#fb923c' }}>{activeComparison.labelB}</span>
            </>
          ) : (
            formatPassengerDescription(passengerData.sex, passengerData.pclass, passengerData.age, passengerData.fare)
          )}
        </span>
        {onEditClick && (
          <button
            onClick={onEditClick}
            className="flex items-center gap-1 text-sm hover:underline"
            style={{ color: UI_COLORS.buttonPrimaryBg }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            Edit
          </button>
        )}
      </h3>

      {/* Decision Tree Section - Full Width on Top */}
      <section className="rounded-lg pt-6 px-6 pb-2 shadow-lg" style={{ backgroundColor: UI_COLORS.sectionBg }}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold" style={{ color: UI_COLORS.textPrimary }}>Decision Tree Explanation</h2>
        </div>

        <ErrorBoundary errorTitle="Decision Tree Visualization Error">
          {treeData ? (
            <div>
              <DecisionTreeVizHorizontal
                treeData={treeData.tree}
                passengerValues={passengerData}
                highlightMode={highlightMode}
                comparisonData={hasQuery ? activeComparison : null}
                height={420}
              />
            </div>
          ) : (
            <LoadingSkeleton variant="tree" className="mb-6" />
          )}
        </ErrorBoundary>
      </section>

      {/* XGBoost SHAP Section - Cards in Row Layout */}
      <section className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: UI_COLORS.sectionBg }}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold" style={{ color: UI_COLORS.textPrimary }}>
            XGBoost (SHAP) Explanation
            {activeComparison && hasQuery && (
              <>
                {' '}
                <span style={{ color: '#60a5fa' }}>{activeComparison.labelA}</span>
                {' vs '}
                <span style={{ color: '#fb923c' }}>{activeComparison.labelB}</span>
              </>
            )}
          </h2>
        </div>

        {/* Comparison Mode: 2 waterfalls side-by-side, global underneath */}
        {activeComparison && hasQuery ? (
          <>
            {/* Two comparison waterfalls side by side */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Cohort A Waterfall */}
              <div className="rounded-lg p-4" style={{ backgroundColor: UI_COLORS.sectionBgDark }}>
                <ErrorBoundary errorTitle="SHAP Waterfall Error (Cohort A)">
                  {shapLoadingA ? (
                    <LoadingSkeleton variant="chart" />
                  ) : shapDataA ? (
                    <SHAPWaterfall
                      waterfallData={shapDataA.waterfall_data}
                      baseValue={shapDataA.base_value}
                      finalPrediction={shapDataA.final_prediction}
                      highlightFeatures={highlightFeatures}
                      passengerData={activeComparison?.cohortA}
                    />
                  ) : (
                    <LoadingSkeleton variant="chart" />
                  )}
                </ErrorBoundary>
              </div>

              {/* Cohort B Waterfall */}
              <div className="rounded-lg p-4" style={{ backgroundColor: UI_COLORS.sectionBgDark }}>
                <ErrorBoundary errorTitle="SHAP Waterfall Error (Cohort B)">
                  {shapLoadingB ? (
                    <LoadingSkeleton variant="chart" />
                  ) : shapDataB ? (
                    <SHAPWaterfall
                      waterfallData={shapDataB.waterfall_data}
                      baseValue={shapDataB.base_value}
                      finalPrediction={shapDataB.final_prediction}
                      highlightFeatures={highlightFeatures}
                      passengerData={activeComparison?.cohortB}
                    />
                  ) : (
                    <LoadingSkeleton variant="chart" />
                  )}
                </ErrorBoundary>
              </div>
            </div>

            {/* Global Feature Importance (full width below comparisons) */}
            <div className="rounded-lg p-4" style={{ backgroundColor: UI_COLORS.sectionBgDark }}>
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
          /* Single Mode: Waterfall (70%) and global (30%) side-by-side */
          <div className="flex gap-6">
            {/* SHAP Waterfall - 70% */}
            <div className="rounded-lg p-4 w-[70%]" style={{ backgroundColor: UI_COLORS.sectionBgDark }}>
              <ErrorBoundary errorTitle="SHAP Waterfall Error">
                {shapLoading ? (
                  <LoadingSkeleton variant="chart" />
                ) : shapData ? (
                  <SHAPWaterfall
                    waterfallData={shapData.waterfall_data}
                    baseValue={shapData.base_value}
                    finalPrediction={shapData.final_prediction}
                    highlightFeatures={highlightFeatures}
                    passengerData={passengerData}
                  />
                ) : (
                  <LoadingSkeleton variant="chart" />
                )}
              </ErrorBoundary>
            </div>

            {/* Global Feature Importance - 30% */}
            <div className="rounded-lg p-4 w-[30%]" style={{ backgroundColor: UI_COLORS.sectionBgDark }}>
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
      <section className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: UI_COLORS.sectionBg }}>
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
