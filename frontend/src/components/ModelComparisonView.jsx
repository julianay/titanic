import useFetchTree from '../hooks/useFetchTree'
import useSHAPExplanation from '../hooks/useSHAPExplanation'
import useGlobalImportance from '../hooks/useGlobalImportance'
import DecisionTreeViz from './visualizations/DecisionTreeViz'
import SHAPWaterfall from './visualizations/SHAPWaterfall'
import GlobalFeatureImportance from './visualizations/GlobalFeatureImportance'
import LoadingSpinner from './LoadingSpinner'

/**
 * ModelComparisonView - Unified view showing both Decision Tree and XGBoost explanations
 */
function ModelComparisonView({ passengerData }) {
  const { data: treeData, loading: treeLoading } = useFetchTree()
  const { data: shapData, loading: shapLoading } = useSHAPExplanation(passengerData)
  const { data: globalImportance, loading: globalLoading } = useGlobalImportance()

  if (treeLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner message="Loading decision tree..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Decision Tree Section */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Decision Tree Explanation</h2>
        <p className="text-sm text-gray-400 mb-4">
          Shows the decision path through the tree based on passenger characteristics
        </p>

        {treeData ? (
          <DecisionTreeViz
            treeData={treeData.tree}
            passengerValues={passengerData}
          />
        ) : (
          <div className="text-gray-400">Loading tree...</div>
        )}
      </section>

      {/* XGBoost SHAP Section */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">XGBoost (SHAP) Explanation</h2>
        <p className="text-sm text-gray-400 mb-4">
          Shows how each feature contributes to the prediction
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SHAP Waterfall */}
          <div className="bg-gray-900 rounded-lg p-4">
            {shapLoading ? (
              <LoadingSpinner message="Calculating SHAP values..." />
            ) : shapData ? (
              <SHAPWaterfall
                waterfallData={shapData.waterfall_data}
                baseValue={shapData.base_value}
                finalPrediction={shapData.final_prediction}
              />
            ) : (
              <div className="text-gray-400">Loading SHAP...</div>
            )}
          </div>

          {/* Global Feature Importance */}
          <div className="bg-gray-900 rounded-lg p-4">
            {globalLoading ? (
              <LoadingSpinner message="Loading feature importance..." />
            ) : globalImportance?.feature_importance ? (
              <GlobalFeatureImportance
                data={globalImportance.feature_importance.map(item => ({
                  feature: item.feature,
                  value: item.importance
                }))}
              />
            ) : (
              <div className="text-gray-400">Loading importance...</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ModelComparisonView
