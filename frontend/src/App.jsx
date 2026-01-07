import { useState } from 'react'
import Layout from './components/Layout'
import ModelComparisonView from './components/ModelComparisonView'
import ChatPanel from './components/ChatPanel'
import WhatIfModal from './components/WhatIfModal'
import useTutorial from './hooks/useTutorial'
import useInitialAnimation from './hooks/useInitialAnimation'
import { formatPassengerDescription, detectComparison, generateCohortLabel } from './utils/cohortPatterns'

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
      type: 'prediction',
      passengerData: { sex: 0, pclass: 1, age: 8, fare: 84 },
      label: initialPassengerDesc
    }
  ])
  const [hasQuery, setHasQuery] = useState(true) // Set to true so visualizations show on load

  // Track active comparison for visualization
  const [activeComparison, setActiveComparison] = useState(null)

  // Track which message is currently being displayed in visualizations
  const [activeMessageIndex, setActiveMessageIndex] = useState(0)

  // Track what-if mode (temporary state while adjusting parameters)
  const [whatIfData, setWhatIfData] = useState(null)
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false)
  const [initialComparisonData, setInitialComparisonData] = useState(null)

  // Tutorial hook
  const tutorial = useTutorial(
    setPassengerData,  // onPassengerChange
    (message) => setChatMessages(prev => [...prev, message])  // onAddChatMessage
  )

  // Initial animation hook (auto-plays on first load)
  const initialAnimation = useInitialAnimation()

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
    setChatMessages(prev => {
      const newMessages = [
        ...prev,
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          type: 'prediction',
          passengerData: { sex, pclass, age, fare },
          label: passengerDesc
        }
      ]
      setActiveMessageIndex(newMessages.length - 1) // Set active to the new prediction message
      return newMessages
    })
  }

  // Handle What-If chip click - open modal
  const handleWhatIfStart = () => {
    // Check if we're editing a comparison
    if (activeComparison) {
      // Initialize with comparison data
      setInitialComparisonData({
        cohortA: { ...activeComparison.cohortA },
        cohortB: { ...activeComparison.cohortB }
      })
      setWhatIfData(null) // Clear single mode data
    } else {
      // Initialize with current passenger data
      setWhatIfData({ ...passengerData })
      setInitialComparisonData(null) // Clear comparison mode data
    }
    setIsWhatIfModalOpen(true)
  }

  // Handle Edit button click from cards - open modal with card's data
  const handleEditCard = (data) => {
    if (data.comparison) {
      // Editing a comparison card - open in comparison mode
      setInitialComparisonData({
        cohortA: { ...data.comparison.cohortA },
        cohortB: { ...data.comparison.cohortB }
      })
      setWhatIfData(null) // Clear single mode data
    } else if (data.passengerData) {
      // Editing a single prediction card - open in single mode
      setWhatIfData({ ...data.passengerData })
      setInitialComparisonData(null) // Clear comparison mode data
    }
    setIsWhatIfModalOpen(true)
  }

  // Handle percentage click - highlight cohort path on decision tree
  const handleHighlightCohort = (cohortData, comparisonData, messageIndex) => {
    // Update passenger data to show the path for this cohort
    setPassengerData({ ...cohortData })
    setHasQuery(true)

    if (comparisonData) {
      // Preserve comparison mode when clicking from a comparison card
      setActiveComparison(comparisonData)
    } else {
      // Clear comparison mode when clicking from a single prediction card
      setActiveComparison(null)
    }

    // Update active message to highlight the correct section in chat
    if (messageIndex !== undefined) {
      setActiveMessageIndex(messageIndex)
    }
  }

  // Handle what-if control changes (update temporary state)
  const handleWhatIfChange = (field, value) => {
    setWhatIfData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle what-if apply - update main passenger data and show results
  const handleWhatIfApply = () => {
    if (!whatIfData) return

    const { sex, pclass, age, fare } = whatIfData
    const passengerDesc = formatPassengerDescription(sex, pclass, age, fare)

    // Update main passenger data
    setPassengerData(whatIfData)
    setHasQuery(true)
    setActiveComparison(null)

    // Add prediction card to chat
    setChatMessages(prev => {
      const newMessages = [
        ...prev,
        {
          role: 'assistant',
          type: 'prediction',
          passengerData: whatIfData,
          label: passengerDesc
        }
      ]
      setActiveMessageIndex(newMessages.length - 1) // Set active to the new prediction message
      return newMessages
    })

    // Clear what-if mode
    setWhatIfData(null)
  }

  // Close what-if modal
  const closeWhatIfModal = () => {
    setIsWhatIfModalOpen(false)
    setWhatIfData(null)
    setInitialComparisonData(null)
  }

  // Handle what-if compare - compare two scenarios from the modal
  const handleWhatIfCompare = (cohortAData, cohortBData) => {
    // Create comparison object from the two cohorts
    const comparisonResult = {
      isComparison: true,
      cohortA: { ...cohortAData },
      cohortB: { ...cohortBData },
      labelA: generateCohortLabel(cohortAData),
      labelB: generateCohortLabel(cohortBData),
      description: `Comparing ${generateCohortLabel(cohortAData)} vs ${generateCohortLabel(cohortBData)}`
    }

    setHasQuery(true)
    setActiveComparison(comparisonResult)

    // Add comparison card to chat
    setChatMessages(prev => {
      const newMessages = [
        ...prev,
        { role: 'user', content: 'Compare these scenarios' },
        {
          role: 'assistant',
          type: 'comparison',
          comparison: comparisonResult
        }
      ]
      setActiveMessageIndex(newMessages.length - 1) // Set active to the new comparison message
      return newMessages
    })

    // Clear what-if mode
    setWhatIfData(null)
    setInitialComparisonData(null)
  }

  // Handle chat message submission
  const handleSendMessage = (userMessage, parsedParams) => {
    // First, check if this is a comparison query
    const comparisonResult = detectComparison(userMessage)

    if (comparisonResult.isComparison) {
      setHasQuery(true) // Mark that user has made a query
      // Handle comparison query - set active comparison for visualization
      setActiveComparison(comparisonResult)

      setChatMessages(prev => {
        const newMessages = [
          ...prev,
          { role: 'user', content: userMessage },
          {
            role: 'assistant',
            type: 'comparison',
            comparison: comparisonResult
          }
        ]
        setActiveMessageIndex(newMessages.length - 1) // Set active to the new comparison message
        return newMessages
      })
      return
    }

    // Not a comparison - clear active comparison and handle as regular query
    setActiveComparison(null)

    if (!parsedParams) {
      // Could not parse - show error (don't update activeMessageIndex for errors)
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
    setChatMessages(prev => {
      const newMessages = [
        ...prev,
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          type: 'prediction',
          passengerData: { sex, pclass, age, fare },
          label: passengerDesc
        }
      ]
      setActiveMessageIndex(newMessages.length - 1) // Set active to the new prediction message
      return newMessages
    })
  }

  // Determine which highlights to use (tutorial takes precedence, then initial animation)
  const getHighlightMode = () => {
    if (tutorial.tutorialActive) return tutorial.getHighlightMode()
    if (initialAnimation.isAnimating) return initialAnimation.getHighlightMode()
    return null
  }

  const getHighlightFeatures = () => {
    if (tutorial.tutorialActive) return tutorial.getHighlightFeatures()
    if (initialAnimation.isAnimating) return initialAnimation.getHighlightFeatures()
    return null
  }

  return (
    <>
      <Layout
        title="Explainable AI Explorer"
        subtitle="How two models predict survival (Titanic dataset)"
        leftContent={
          <ModelComparisonView
            passengerData={passengerData}
            highlightMode={getHighlightMode()}
            highlightFeatures={getHighlightFeatures()}
            activeComparison={activeComparison}
            hasQuery={hasQuery}
            onEditClick={handleWhatIfStart}
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
            onWhatIfStart={handleWhatIfStart}
            onEditCard={handleEditCard}
            onHighlightCohort={handleHighlightCohort}
            activeMessageIndex={activeMessageIndex}
          />
        }
      />

      <WhatIfModal
        isOpen={isWhatIfModalOpen}
        onClose={closeWhatIfModal}
        values={whatIfData || passengerData}
        onChange={handleWhatIfChange}
        onApply={handleWhatIfApply}
        onCompare={handleWhatIfCompare}
        initialComparisonData={initialComparisonData}
      />
    </>
  )
}

export default App
