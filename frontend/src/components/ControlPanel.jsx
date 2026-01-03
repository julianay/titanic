import { useEffect, useState } from 'react'
import { UI_COLORS } from '../utils/uiStyles'

/**
 * ControlPanel - Collapsible accordion with passenger parameter controls
 *
 * Displays sliders and radio buttons for adjusting passenger parameters.
 * Defaults to closed state to maximize chat space.
 *
 * @param {Object} values - Current passenger parameter values
 * @param {number} values.sex - 0=Female, 1=Male
 * @param {number} values.pclass - 1=First class, 2=Second, 3=Third
 * @param {number} values.age - Age in years (0-80)
 * @param {number} values.fare - Ticket fare in pounds (0-100)
 * @param {Function} onChange - Callback when control changes: (field, value) => void
 * @param {Function} onPresetSelect - Callback when preset selected (updates controls)
 * @param {Function} onPresetChat - Callback when preset selected (adds chat message)
 *
 * @example
 * <ControlPanel
 *   values={{ sex: 0, pclass: 2, age: 30, fare: 20 }}
 *   onChange={(field, value) => setPassengerData(prev => ({ ...prev, [field]: value }))}
 * />
 *
 * COMMON CHANGES:
 * - Default state: Change useState(false) to useState(true) to open by default
 * - Slider ranges: Modify min/max attributes on <input type="range">
 * - Colors: Change bg-[#218FCE] to other colors
 * - Title: Change "What if?" text in accordion header
 *
 * STATE:
 * - isExpanded: Controls accordion open/closed (defaults false)
 * - showFareSuggestion: Shows fare suggestion when class changes
 */
function ControlPanel({ values, onChange, onPresetSelect, onPresetChat }) {
  const [showFareSuggestion, setShowFareSuggestion] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // Default closed for max chat space

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
    <div>
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-left hover:text-[#218FCE] transition-colors"
      >
        <span className="text-sm font-medium">What if?</span>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="space-y-6 pt-3">
          {/* Sex */}
          <div>
            <label className="block text-sm font-medium mb-2">Sex</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  checked={values.sex === 0}
                  onChange={() => onChange('sex', 0)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
                />
                <span className="ml-2 text-sm">Female</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  checked={values.sex === 1}
                  onChange={() => onChange('sex', 1)}
                  className="w-4 h-4 cursor-pointer"
                  style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
                />
                <span className="ml-2 text-sm">Male</span>
              </label>
            </div>
          </div>

      {/* Passenger Class */}
      <div>
        <label className="block text-sm font-medium mb-2">Passenger Class</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="pclass"
              checked={values.pclass === 1}
              onChange={() => onChange('pclass', 1)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
            />
            <span className="ml-2 text-sm">1st</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="pclass"
              checked={values.pclass === 2}
              onChange={() => onChange('pclass', 2)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
            />
            <span className="ml-2 text-sm">2nd</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="pclass"
              checked={values.pclass === 3}
              onChange={() => onChange('pclass', 3)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: UI_COLORS.buttonPrimaryBg }}
            />
            <span className="ml-2 text-sm">3rd</span>
          </label>
        </div>
      </div>

      {/* Age Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Age</label>
          <span className="text-sm font-semibold text-[#218FCE]">{values.age}</span>
        </div>
            <input
              type="range"
              min="0"
              max="80"
              value={values.age}
              onChange={(e) => onChange('age', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: UI_COLORS.buttonPrimaryBg,
                background: `linear-gradient(to right, ${UI_COLORS.buttonPrimaryBg} 0%, ${UI_COLORS.buttonPrimaryBg} ${(values.age / 80) * 100}%, #374151 ${(values.age / 80) * 100}%, #374151 100%)`
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
          <label className="text-sm font-medium">Fare</label>
          <span className="text-sm font-semibold text-[#218FCE]">£{values.fare}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={values.fare}
          onChange={(e) => onChange('fare', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            accentColor: UI_COLORS.buttonPrimaryBg,
            background: `linear-gradient(to right, ${UI_COLORS.buttonPrimaryBg} 0%, ${UI_COLORS.buttonPrimaryBg} ${(values.fare / 100) * 100}%, #374151 ${(values.fare / 100) * 100}%, #374151 100%)`
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

          {/* Passenger Description */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400 leading-relaxed">
              {getDescription()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ControlPanel
