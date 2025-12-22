import { useState } from 'react'
import Layout from './components/Layout'
import ControlPanel from './components/ControlPanel'
import ModelComparisonView from './components/ModelComparisonView'
import ChatPanel from './components/ChatPanel'
import useTutorial from './hooks/useTutorial'
import { formatPassengerDescription, detectComparison } from './utils/cohortPatterns'

function App() {
  const [passengerData, setPassengerData] = useState({
    sex: 0,       // 0 = Female, 1 = Male
    pclass: 1,    // 1, 2, or 3 (default: 1st class)
    age: 8,       // 0-80 (child)
    fare: 84      // 0-100 (standard 1st class fare)
  })

  const initialPassengerDesc = formatPassengerDescription(0, 1, 8, 84)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `Showing: ${initialPassengerDesc}`
    },
    {
      role: 'assistant',
      type: 'prediction',
      passengerData: { sex: 0, pclass: 1, age: 8, fare: 84 },
      label: initialPassengerDesc
    }
  ])
  const [hasQuery, setHasQuery] = useState(true) // Set to true so visualizations show on load

  // Track active comparison for visualization
  const [activeComparison, setActiveComparison] = useState(null)

  // Tutorial hook
  const tutorial = useTutorial(
    setPassengerData,  // onPassengerChange
    (message) => setChatMessages(prev => [...prev, message])  // onAddChatMessage
  )

  const handleChange = (field, value) => {
    setPassengerData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasQuery(true) // Mark that user has made a query
    setActiveComparison(null) // Clear any active comparison
  }

  // Handle preset selection - update all values at once
  const handlePresetSelect = (presetValues) => {
    setPassengerData(presetValues)
    setHasQuery(true) // Mark that user has made a query
    setActiveComparison(null) // Clear any active comparison
  }

  // Handle preset chat message
  const handlePresetChat = (preset) => {
    const { sex, pclass, age, fare } = preset.values
    const userMessage = preset.label.replace(/[🎭👨👶⚓]/g, '').trim() // Remove emoji
    const passengerDesc = formatPassengerDescription(sex, pclass, age, fare)

    setHasQuery(true) // Mark that user has made a query
    setActiveComparison(null) // Clear any active comparison

    // Add messages to chat with prediction card
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      {
        role: 'assistant',
        type: 'prediction',
        passengerData: { sex, pclass, age, fare },
        label: passengerDesc
      }
    ])
  }

  // Handle chat message submission
  const handleSendMessage = (userMessage, parsedParams) => {
    // First, check if this is a comparison query
    const comparisonResult = detectComparison(userMessage)

    if (comparisonResult.isComparison) {
      setHasQuery(true) // Mark that user has made a query
      // Handle comparison query - set active comparison for visualization
      setActiveComparison(comparisonResult)

      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          type: 'comparison',
          comparison: comparisonResult
        }
      ])
      return
    }

    // Not a comparison - clear active comparison and handle as regular query
    setActiveComparison(null)

    if (!parsedParams) {
      // Could not parse - show error
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: "I couldn't understand that query. Try asking about passenger types like 'woman in 1st class' or '3rd class male', or compare cohorts like 'women vs men'." }
      ])
      return
    }

    setHasQuery(true) // Mark that user has made a query

    const { sex, pclass, age, fare } = parsedParams

    // Update passenger data
    setPassengerData({ sex, pclass, age, fare })

    const passengerDesc = formatPassengerDescription(sex, pclass, age, fare)

    // Add messages to chat with prediction card
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      {
        role: 'assistant',
        type: 'prediction',
        passengerData: { sex, pclass, age, fare },
        label: passengerDesc
      }
    ])
  }

  return (
    <Layout
      title="Explainable AI Explorer"
      subtitle="Interactively compare how two models reason about the same prediction task"
      leftContent={
        <ModelComparisonView
          passengerData={passengerData}
          highlightMode={tutorial.getHighlightMode()}
          highlightFeatures={tutorial.getHighlightFeatures()}
          activeComparison={activeComparison}
          hasQuery={hasQuery}
        />
      }
      controlsContent={
        <ControlPanel
          values={passengerData}
          onChange={handleChange}
          onPresetSelect={handlePresetSelect}
          onPresetChat={handlePresetChat}
        />
      }
      chatContent={
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onPresetSelect={handlePresetSelect}
          onPresetChat={handlePresetChat}
          onTutorialAdvance={tutorial.advanceTutorial}
          onTutorialSkip={tutorial.skipTutorial}
          onTutorialStart={tutorial.startTutorial}
        />
      }
    />
  )
}

export default App
