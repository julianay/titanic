import { useState } from 'react'
import Layout from './components/Layout'
import ControlPanel from './components/ControlPanel'
import LoadingSpinner from './components/LoadingSpinner'
import usePredict from './hooks/usePredict'

function App() {
  const [passengerData, setPassengerData] = useState({
    sex: 0,       // 0 = Female, 1 = Male
    pclass: 2,    // 1, 2, or 3
    age: 30,      // 0-80
    fare: 20      // 0-100
  })

  // Call prediction API with debouncing and caching
  const { data, loading, error } = usePredict(passengerData)

  const handleChange = (field, value) => {
    setPassengerData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle preset selection - update all values at once
  const handlePresetSelect = (presetValues) => {
    setPassengerData(presetValues)
  }

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

  // Render prediction results
  const renderPredictionResults = () => {
    if (loading) {
      return <LoadingSpinner message="Calculating prediction..." />
    }

    if (error) {
      return (
        <div className="p-6 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
          <p className="text-red-400 font-medium mb-2">Error</p>
          <p className="text-red-300 text-sm">{error.message}</p>
          <p className="text-gray-400 text-xs mt-2">
            Make sure the backend is running on port 8000
          </p>
        </div>
      )
    }

    if (data) {
      const survivalProbability = Math.round(data.survival_rate)
      const survived = data.prediction === 1

      return (
        <div className={`p-6 border rounded-lg ${getBackgroundColor(survivalProbability)}`}>
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
              {survived ? 'Survived' : 'Died'}
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Layout
      title="Explainable AI Explorer"
      subtitle="Interactively compare how two models reason about the same prediction task"
      leftContent={
        <div className="space-y-6">
          {/* Placeholder for future visualization */}
          <div className="bg-gray-800 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">SHAP visualization will go here</p>
          </div>

          {/* Prediction Results */}
          {renderPredictionResults()}
        </div>
      }
      rightContent={
        <ControlPanel
          values={passengerData}
          onChange={handleChange}
          onPresetSelect={handlePresetSelect}
        />
      }
    />
  )
}

export default App
