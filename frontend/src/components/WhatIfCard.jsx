import { useEffect, useState } from 'react'

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
 *
 * @example
 * <WhatIfCard
 *   values={{ sex: 0, pclass: 2, age: 30, fare: 20 }}
 *   onChange={(field, value) => setPassengerData(prev => ({ ...prev, [field]: value }))}
 *   onApply={() => handleApply()}
 * />
 */
function WhatIfCard({ values, onChange, onApply }) {
  const [showFareSuggestion, setShowFareSuggestion] = useState(false)

  // Suggested fares for each class (historical averages)
  const suggestedFares = {
    1: 84,  // First class
    2: 20,  // Second class
    3: 13   // Third class
  }

  // Check if fare is unusual for the class (more than 30% different from suggested)
  const getFareSuggestion = () => {
    const suggested = suggestedFares[values.pclass]
    const difference = Math.abs(values.fare - suggested)
    const percentDiff = (difference / suggested) * 100

    if (percentDiff > 30) {
      return `Usually £${suggested} for ${getClassLabel(values.pclass)}`
    }
    return null
  }

  const getClassLabel = (pclass) => {
    const labels = { 1: '1st class', 2: '2nd class', 3: '3rd class' }
    return labels[pclass]
  }

  // When pclass changes, suggest new fare
  useEffect(() => {
    setShowFareSuggestion(true)
    const timer = setTimeout(() => setShowFareSuggestion(false), 3000)
    return () => clearTimeout(timer)
  }, [values.pclass])

  const handleFareUpdate = () => {
    onChange('fare', suggestedFares[values.pclass])
    setShowFareSuggestion(false)
  }

  // Generate passenger description
  const getDescription = () => {
    const sexLabel = values.sex === 0 ? 'female' : 'male'
    const classLabel = getClassLabel(values.pclass)
    return `${values.age}-year-old ${sexLabel} in ${classLabel}, £${values.fare} fare`
  }

  const fareSuggestion = getFareSuggestion()

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#218FCE] mb-1">What If?</h3>
        <p className="text-xs text-gray-400">Adjust parameters to explore different scenarios</p>
      </div>

      <div className="space-y-4">
        {/* Sex */}
        <div>
          <label className="block text-xs font-medium mb-2">Sex</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sex"
                checked={values.sex === 0}
                onChange={() => onChange('sex', 0)}
                className="w-4 h-4 accent-[#218FCE] cursor-pointer"
              />
              <span className="ml-2 text-xs">Female</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sex"
                checked={values.sex === 1}
                onChange={() => onChange('sex', 1)}
                className="w-4 h-4 accent-[#218FCE] cursor-pointer"
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
                name="pclass"
                checked={values.pclass === 1}
                onChange={() => onChange('pclass', 1)}
                className="w-4 h-4 accent-[#218FCE] cursor-pointer"
              />
              <span className="ml-2 text-xs">1st</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="pclass"
                checked={values.pclass === 2}
                onChange={() => onChange('pclass', 2)}
                className="w-4 h-4 accent-[#218FCE] cursor-pointer"
              />
              <span className="ml-2 text-xs">2nd</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="pclass"
                checked={values.pclass === 3}
                onChange={() => onChange('pclass', 3)}
                className="w-4 h-4 accent-[#218FCE] cursor-pointer"
              />
              <span className="ml-2 text-xs">3rd</span>
            </label>
          </div>
        </div>

        {/* Age Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium">Age</label>
            <span className="text-xs font-semibold text-[#218FCE]">{values.age}</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            value={values.age}
            onChange={(e) => onChange('age', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#218FCE]"
            style={{
              background: `linear-gradient(to right, #218FCE 0%, #218FCE ${(values.age / 80) * 100}%, #374151 ${(values.age / 80) * 100}%, #374151 100%)`
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
            <span className="text-xs font-semibold text-[#218FCE]">£{values.fare}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={values.fare}
            onChange={(e) => onChange('fare', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#218FCE]"
            style={{
              background: `linear-gradient(to right, #218FCE 0%, #218FCE ${(values.fare / 100) * 100}%, #374151 ${(values.fare / 100) * 100}%, #374151 100%)`
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
                  onClick={handleFareUpdate}
                  className="text-xs text-[#218FCE] hover:underline"
                >
                  Update
                </button>
              )}
            </div>
          )}
        </div>

        {/* Current Passenger Description */}
        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            {getDescription()}
          </p>

          {/* Apply Changes Button */}
          <button
            onClick={onApply}
            className="w-full px-4 py-2 text-xs bg-[#218FCE] text-white rounded hover:bg-[#1a7ab8] transition-colors font-medium"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default WhatIfCard
