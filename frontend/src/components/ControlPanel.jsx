import { useEffect, useState } from 'react'

function ControlPanel({ values, onChange, onPresetSelect }) {
  const [showFareSuggestion, setShowFareSuggestion] = useState(false)

  // Preset configurations for quick testing
  const presets = [
    { id: 'women', label: '🎭 Women\'s path', values: { sex: 0, pclass: 2, age: 30, fare: 20 } },
    { id: 'men', label: '👨 Men\'s path', values: { sex: 1, pclass: 3, age: 30, fare: 13 } },
    { id: 'child', label: '👶 1st class child', values: { sex: 0, pclass: 1, age: 5, fare: 84 } },
    { id: 'third', label: '⚓ 3rd class male', values: { sex: 1, pclass: 3, age: 40, fare: 8 } }
  ]

  // Suggested fares for each class
  const suggestedFares = {
    1: 84,
    2: 20,
    3: 13
  }

  // Check if current values match any preset
  const getActivePreset = () => {
    return presets.find(preset =>
      preset.values.sex === values.sex &&
      preset.values.pclass === values.pclass &&
      preset.values.age === values.age &&
      preset.values.fare === values.fare
    )
  }

  const activePreset = getActivePreset()

  // Handle preset selection
  const handlePresetClick = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset.values)
    }
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
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div className="pb-4 border-b border-gray-800">
        <p className="text-xs text-gray-400 mb-3">Quick Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const isActive = activePreset?.id === preset.id
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`
                  px-3 py-2 rounded text-xs font-medium transition-all
                  ${isActive
                    ? 'bg-[#218FCE] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-[#218FCE] hover:bg-opacity-20 hover:text-[#218FCE]'
                  }
                `}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

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
              className="w-4 h-4 accent-[#218FCE] cursor-pointer"
            />
            <span className="ml-2 text-sm">Female</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="sex"
              checked={values.sex === 1}
              onChange={() => onChange('sex', 1)}
              className="w-4 h-4 accent-[#218FCE] cursor-pointer"
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
              className="w-4 h-4 accent-[#218FCE] cursor-pointer"
            />
            <span className="ml-2 text-sm">1st</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="pclass"
              checked={values.pclass === 2}
              onChange={() => onChange('pclass', 2)}
              className="w-4 h-4 accent-[#218FCE] cursor-pointer"
            />
            <span className="ml-2 text-sm">2nd</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="pclass"
              checked={values.pclass === 3}
              onChange={() => onChange('pclass', 3)}
              className="w-4 h-4 accent-[#218FCE] cursor-pointer"
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
          <label className="text-sm font-medium">Fare</label>
          <span className="text-sm font-semibold text-[#218FCE]">£{values.fare}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={values.fare}
          onChange={(e) => onChange('fare', parseInt(e.target.value))}
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

      {/* Passenger Description */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-400 leading-relaxed">
          {getDescription()}
        </p>
      </div>
    </div>
  )
}

export default ControlPanel
