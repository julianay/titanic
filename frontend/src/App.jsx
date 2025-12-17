import { useState } from 'react'
import Layout from './components/Layout'
import ControlPanel from './components/ControlPanel'
import ModelComparisonView from './components/ModelComparisonView'
import ChatPanel from './components/ChatPanel'
import { matchToCohort, formatPassengerDescription } from './utils/cohortPatterns'

function App() {
  const [passengerData, setPassengerData] = useState({
    sex: 0,       // 0 = Female, 1 = Male
    pclass: 2,    // 1, 2, or 3
    age: 30,      // 0-80
    fare: 20      // 0-100
  })

  const [chatMessages, setChatMessages] = useState([])

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

  // Handle preset chat message
  const handlePresetChat = (preset) => {
    const { sex, pclass, age, fare } = preset.values
    const userMessage = preset.label.replace(/[🎭👨👶⚓]/g, '').trim() // Remove emoji

    // Get cohort response
    const { cohortInfo } = matchToCohort(sex, pclass, age, fare)
    const passengerDesc = formatPassengerDescription(sex, pclass, age, fare)

    // Add messages to chat
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: `${cohortInfo.response}\n\nShowing: ${passengerDesc}` }
    ])
  }

  // Handle chat message submission
  const handleSendMessage = (userMessage, parsedParams) => {
    if (!parsedParams) {
      // Could not parse - show error
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: "I couldn't understand that query. Try asking about passenger types like 'woman in 1st class' or '3rd class male'." }
      ])
      return
    }

    const { sex, pclass, age, fare } = parsedParams

    // Update passenger data
    setPassengerData({ sex, pclass, age, fare })

    // Get cohort response
    const { cohortInfo } = matchToCohort(sex, pclass, age, fare)
    const passengerDesc = formatPassengerDescription(sex, pclass, age, fare)

    // Add messages to chat
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: `${cohortInfo.response}\n\nShowing: ${passengerDesc}` }
    ])
  }

  return (
    <Layout
      title="Explainable AI Explorer"
      subtitle="Interactively compare how two models reason about the same prediction task"
      leftContent={
        <ModelComparisonView passengerData={passengerData} />
      }
      rightContent={
        <div className="space-y-6">
          <ControlPanel
            values={passengerData}
            onChange={handleChange}
            onPresetSelect={handlePresetSelect}
            onPresetChat={handlePresetChat}
          />
          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-sm font-medium mb-4">Explore by Question</h3>
            <ChatPanel
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      }
    />
  )
}

export default App
