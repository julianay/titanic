import { useState } from 'react'
import Layout from './components/Layout'
import ControlPanel from './components/ControlPanel'
import ModelComparisonView from './components/ModelComparisonView'
import ChatPanel from './components/ChatPanel'
import TutorialControls from './components/TutorialControls'
import useTutorial from './hooks/useTutorial'
import { matchToCohort, formatPassengerDescription, detectComparison } from './utils/cohortPatterns'

function App() {
  const [passengerData, setPassengerData] = useState({
    sex: 0,       // 0 = Female, 1 = Male
    pclass: 2,    // 1, 2, or 3
    age: 30,      // 0-80
    fare: 20      // 0-100
  })

  const [chatMessages, setChatMessages] = useState([])

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
    // First, check if this is a comparison query
    const comparisonResult = detectComparison(userMessage)

    if (comparisonResult.isComparison) {
      // Handle comparison query
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

    // Not a comparison - handle as regular passenger query
    if (!parsedParams) {
      // Could not parse - show error
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: "I couldn't understand that query. Try asking about passenger types like 'woman in 1st class' or '3rd class male', or compare cohorts like 'women vs men'." }
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
        <ModelComparisonView
          passengerData={passengerData}
          highlightMode={tutorial.getHighlightMode()}
          highlightFeatures={tutorial.getHighlightFeatures()}
        />
      }
      controlsContent={
        <>
          <ControlPanel
            values={passengerData}
            onChange={handleChange}
            onPresetSelect={handlePresetSelect}
            onPresetChat={handlePresetChat}
          />

          {/* Tutorial Controls */}
          <TutorialControls
            tutorialActive={tutorial.tutorialActive}
            tutorialStep={tutorial.tutorialStep}
            onAdvance={tutorial.advanceTutorial}
            onSkip={tutorial.skipTutorial}
          />
        </>
      }
      chatContent={
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onPresetSelect={handlePresetSelect}
          onPresetChat={handlePresetChat}
        />
      }
    />
  )
}

export default App
