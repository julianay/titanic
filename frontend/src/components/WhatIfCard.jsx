import { useEffect, useState } from 'react'
import { UI_COLORS } from '../utils/uiStyles'

/**
 * WhatIfCard - Interactive card for adjusting passenger parameters within chat
 *
 * Displays sliders and radio buttons for adjusting passenger parameters.
 * Appears in chat when user clicks "What If?" suggestion chip.
 *
 * @param {Object} values - Current passenger parameter values
 * @param {number} values.sex - 0=Female, 1=Male
 * @param {number} values.pclass - 1=First class, 2=Second, 3=Third
 * @param {number} values.age - Age in years (0-80)
 * @param {number} values.fare - Ticket fare in pounds (0-100)
 * @param {Function} onChange - Callback when control changes: (field, value) => void
 * @param {Function} onApply - Callback when "Apply Changes" button clicked
 * @param {Function} onCompare - Optional callback when "Compare" button clicked
 * @param {Object} initialComparisonData - Optional initial comparison data {cohortA, cohortB}
 *
 * @example
 * <WhatIfCard
 *   values={{ sex: 0, pclass: 2, age: 30, fare: 20 }}
 *   onChange={(field, value) => setPassengerData(prev => ({ ...prev, [field]: value }))}
 *   onApply={() => handleApply()}
 *   onCompare={() => handleCompare()}
 * />
 */
function WhatIfCard({ values, onChange, onApply, onCompare, initialComparisonData }) {
  const [showFareSuggestion, setShowFareSuggestion] = useState(false)
  const [isComparisonMode, setIsComparisonMode] = useState(!!initialComparisonData)
  const [cohortA, setCohortA] = useState(initialComparisonData?.cohortA || { ...values })
  const [cohortB, setCohortB] = useState(initialComparisonData?.cohortB || { ...values })

  // Suggested fares for each class (historical averages)
  const suggestedFares = {
    1: 84,  // First class
    2: 20,  // Second class
    3: 13   // Third class
  }

  // Check if fare is unusual for the class (more than 30% different from suggested)
  const getFareSuggestion = (cohortValues) => {
    const suggested = suggestedFares[cohortValues.pclass]
    const difference = Math.abs(cohortValues.fare - suggested)
    const percentDiff = (difference / suggested) * 100

    if (percentDiff > 30) {
      return `Usually £${suggested} for ${getClassLabel(cohortValues.pclass)}`
    }
    return null
  }

  const getClassLabel = (pclass) => {
    const labels = { 1: '1st class', 2: '2nd class', 3: '3rd class' }
    return labels[pclass]
  }

  // Initialize state when initialComparisonData changes (modal reopens)
  useEffect(() => {
    if (initialComparisonData) {
      setIsComparisonMode(true)
      setCohortA({ ...initialComparisonData.cohortA })
      setCohortB({ ...initialComparisonData.cohortB })
    } else {
      setIsComparisonMode(false)
      setCohortA({ ...values })
      setCohortB({ ...values })
    }
  }, [initialComparisonData])

  // Note: Fare now auto-updates when pclass changes, but users can still manually adjust
  // Show fare suggestion if they manually set an unusual fare for the class
  useEffect(() => {
    if (values.fare !== suggestedFares[values.pclass]) {
      setShowFareSuggestion(true)
      const timer = setTimeout(() => setShowFareSuggestion(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [values.fare, values.pclass])

  const handleFareUpdate = (cohortValues, updateCohort) => {
    const newFare = suggestedFares[cohortValues.pclass]
    updateCohort({ ...cohortValues, fare: newFare })
    setShowFareSuggestion(false)
  }

  // Generate passenger description
  const getDescription = (cohortValues) => {
    const sexLabel = cohortValues.sex === 0 ? 'female' : 'male'
    const classLabel = getClassLabel(cohortValues.pclass)
    return `${cohortValues.age}-year-old ${sexLabel} in ${classLabel}, £${cohortValues.fare} fare`
  }

  // Handle comparison button click
  const handleCompareClick = () => {
    if (onCompare && isComparisonMode) {
      onCompare(cohortA, cohortB)
    }
  }

  // Render parameter controls for a cohort
  const renderControls = (cohortValues, updateCohort, radioNameSuffix = '') => {
    const fareSuggestion = getFareSuggestion(cohortValues)

    return (
      <div className="space-y-4">
        {/* Sex */}
        <div>
          <label className="block text-xs font-medium mb-2">Sex</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`sex${radioNameSuffix}`}
                checked={cohortValues.sex === 0}
                onChange={() => updateCohort({ ...cohortValues, sex: 0 })}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
              />
              <span className="ml-2 text-xs">Female</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`sex${radioNameSuffix}`}
                checked={cohortValues.sex === 1}
                onChange={() => updateCohort({ ...cohortValues, sex: 1 })}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
              />
              <span className="ml-2 text-xs">Male</span>
            </label>
          </div>
        </div>

        {/* Passenger Class */}
        <div>
          <label className="block text-xs font-medium mb-2">Passenger Class</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`pclass${radioNameSuffix}`}
                checked={cohortValues.pclass === 1}
                onChange={() => updateCohort({ ...cohortValues, pclass: 1, fare: suggestedFares[1] })}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
              />
              <span className="ml-2 text-xs">1st</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`pclass${radioNameSuffix}`}
                checked={cohortValues.pclass === 2}
                onChange={() => updateCohort({ ...cohortValues, pclass: 2, fare: suggestedFares[2] })}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
              />
              <span className="ml-2 text-xs">2nd</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`pclass${radioNameSuffix}`}
                checked={cohortValues.pclass === 3}
                onChange={() => updateCohort({ ...cohortValues, pclass: 3, fare: suggestedFares[3] })}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
              />
              <span className="ml-2 text-xs">3rd</span>
            </label>
          </div>
        </div>

        {/* Age Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium">Age</label>
            <span className="text-xs font-semibold text-[#218FCE]">{cohortValues.age}</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={cohortValues.age}
            onChange={(e) => updateCohort({ ...cohortValues, age: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: UI_COLORS.buttonPrimaryBg,
              background: `linear-gradient(to right, ${UI_COLORS.buttonPrimaryBg} 0%, ${UI_COLORS.buttonPrimaryBg} ${(cohortValues.age / 80) * 100}%, #374151 ${(cohortValues.age / 80) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>80</span>
          </div>
        </div>

        {/* Fare Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium">Fare</label>
            <span className="text-xs font-semibold text-[#218FCE]">£{cohortValues.fare}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={cohortValues.fare}
            onChange={(e) => updateCohort({ ...cohortValues, fare: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: UI_COLORS.buttonPrimaryBg,
              background: `linear-gradient(to right, ${UI_COLORS.buttonPrimaryBg} 0%, ${UI_COLORS.buttonPrimaryBg} ${(cohortValues.fare / 100) * 100}%, #374151 ${(cohortValues.fare / 100) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>£0</span>
            <span>£100</span>
          </div>

          {/* Fare suggestion badge */}
          {fareSuggestion && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs bg-[#218FCE] bg-opacity-20 text-[#218FCE] px-2 py-1 rounded">
                {fareSuggestion}
              </span>
              {showFareSuggestion && (
                <button
                  onClick={() => handleFareUpdate(cohortValues, updateCohort)}
                  className="text-xs text-[#218FCE] hover:underline"
                >
                  Update
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#218FCE] mb-1">What If?</h3>
        <p className="text-xs text-gray-400">
          Adjust parameters to explore different scenarios
          {onCompare && !isComparisonMode && (
            <>
              , or{' '}
              <button
                onClick={() => setIsComparisonMode(true)}
                className="font-bold text-[#218FCE] hover:underline"
              >
                compare scenarios
              </button>
            </>
          )}
        </p>
      </div>

      {isComparisonMode ? (
        // Comparison mode: Two side-by-side sections
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Cohort A */}
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <h4 className="text-xs font-semibold text-[#218FCE] mb-3">Scenario A</h4>
              {renderControls(cohortA, setCohortA, '-a')}
            </div>

            {/* Cohort B */}
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <h4 className="text-xs font-semibold text-[#218FCE] mb-3">Scenario B</h4>
              {renderControls(cohortB, setCohortB, '-b')}
            </div>
          </div>

          {/* Comparison Action Buttons */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setIsComparisonMode(false)}
                className="flex-1 px-4 py-2 text-xs text-white rounded transition-colors font-medium"
                style={{ backgroundColor: UI_COLORS.buttonSecondaryBg }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonSecondaryBgHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonSecondaryBg)}
              >
                Cancel
              </button>
              <button
                onClick={handleCompareClick}
                className="flex-1 px-4 py-2 text-xs text-white rounded transition-colors font-medium"
                style={{ backgroundColor: UI_COLORS.buttonPrimaryBg }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBgHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBg)}
              >
                Compare
              </button>
            </div>
          </div>
        </>
      ) : (
        // Single mode: One set of controls
        <>
          {renderControls(values, (newValues) => {
            // Update each field individually through onChange
            Object.keys(newValues).forEach(key => {
              if (newValues[key] !== values[key]) {
                onChange(key, newValues[key])
              }
            })
          })}

          {/* Current Passenger Description */}
          <div className="pt-4 border-t border-gray-700 mt-4">
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              {getDescription(values)}
            </p>

            {/* Apply Changes Button */}
            <button
              onClick={onApply}
              className="w-full px-4 py-2 text-xs text-white rounded transition-colors font-medium"
              style={{ backgroundColor: UI_COLORS.buttonSecondaryBg }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonSecondaryBgHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonSecondaryBg)}
            >
              Apply Changes
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default WhatIfCard
