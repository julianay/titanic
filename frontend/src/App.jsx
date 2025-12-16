import { useState } from 'react'
import Layout from './components/Layout'
import ControlPanel from './components/ControlPanel'
import ModelComparisonView from './components/ModelComparisonView'

function App() {
  const [passengerData, setPassengerData] = useState({
    sex: 0,       // 0 = Female, 1 = Male
    pclass: 2,    // 1, 2, or 3
    age: 30,      // 0-80
    fare: 20      // 0-100
  })

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

  return (
    <Layout
      title="Explainable AI Explorer"
      subtitle="Interactively compare how two models reason about the same prediction task"
      leftContent={
        <ModelComparisonView passengerData={passengerData} />
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
