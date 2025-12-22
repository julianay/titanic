import { useState, useRef, useEffect } from 'react'
import { parsePassengerQuery } from '../utils/cohortPatterns'
import ComparisonCard from './ComparisonCard'
import SinglePredictionCard from './SinglePredictionCard'
import WhatIfCard from './WhatIfCard'
import './ChatPanel.css'

/**
 * ChatPanel - Natural language chat interface with suggestion chips
 *
 * Allows users to query passenger survival rates using natural language.
 * Displays suggestion chips above input for quick access to common queries.
 * Auto-scrolls to show latest messages.
 *
 * @param {Array} messages - Array of message objects with structure:
 *   - { role: 'user', content: string } for user messages
 *   - { role: 'assistant', content: string } for text responses
 *   - { role: 'assistant', type: 'comparison', comparison: {...} } for comparison cards
 *   - { role: 'assistant', type: 'prediction', passengerData: {...}, label: string } for prediction cards
 *   - { role: 'assistant', type: 'tutorial', content: string, step: number, isLastStep: boolean } for tutorial messages
 * @param {Function} onSendMessage - Callback when message sent: (text, parsedParams) => void
 * @param {Function} onPresetSelect - Callback when preset chip clicked (updates controls)
 * @param {Function} onPresetChat - Callback when preset chip clicked (adds chat message)
 * @param {Function} onTutorialAdvance - Callback when tutorial Next button clicked
 * @param {Function} onTutorialSkip - Callback when tutorial Skip button clicked
 * @param {Function} onTutorialStart - Callback when tutorial Start button clicked
 * @param {Function} onWhatIfStart - Callback when What If chip clicked
 * @param {Function} onWhatIfChange - Callback when what-if controls change: (field, value) => void
 * @param {Function} onWhatIfApply - Callback when what-if Apply button clicked
 *
 * @example
 * <ChatPanel
 *   messages={chatMessages}
 *   onSendMessage={(text, params) => handleMessage(text, params)}
 *   onPresetSelect={(values) => setPassengerData(values)}
 *   onPresetChat={(preset) => addChatMessage(preset)}
 *   onTutorialAdvance={() => tutorial.advanceTutorial()}
 *   onTutorialSkip={() => tutorial.skipTutorial()}
 *   onTutorialStart={() => tutorial.startTutorial()}
 * />
 *
 * SUGGESTION CHIPS BEHAVIOR:
 * - Chips stay visible during tutorial and when clicking chip suggestions
 * - Chips only hide after user types and submits their own custom message
 * - Show/hide toggle allows users to collapse chips for more chat space
 * - Toggle state persists during session (via chipsVisible state)
 *
 * COMMON CHANGES:
 * - Add suggestion: Add to suggestionButtons array (line 98)
 * - Message spacing: Change space-y-3 to space-y-4, etc.
 * - Input styling: Modify className on <input> element
 * - Button colors: Change bg-[#218FCE] to other colors
 * - Chips visibility: Edit hasTypedMessage state logic (line 50, 63)
 *
 * NATURAL LANGUAGE SUPPORT:
 * - Passenger queries: "show me a woman in 1st class"
 * - Comparisons: "compare women vs men", "1st class vs 3rd class"
 * - Parsed by parsePassengerQuery() in cohortPatterns.js
 */
function ChatPanel({ messages, onSendMessage, onPresetSelect, onPresetChat, onTutorialAdvance, onTutorialSkip, onTutorialStart, onWhatIfStart, onWhatIfChange, onWhatIfApply }) {
  const [inputValue, setInputValue] = useState('')
  const [hasTypedMessage, setHasTypedMessage] = useState(false) // Track if user has typed their own message
  const [chipsVisible, setChipsVisible] = useState(true) // Track if chips are shown/hidden
  const messagesEndRef = useRef(null)
  const [prevMessageCount, setPrevMessageCount] = useState(messages.length)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Track message count changes for animation purposes
    if (messages.length > prevMessageCount) {
      setPrevMessageCount(messages.length)
    }

    // Scroll immediately for instant feedback
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    // Scroll again after delays to account for async content loading (like ComparisonCard)
    // Multiple timeouts ensure we catch content as it loads
    const timeoutId1 = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    const timeoutId2 = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 500)

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [messages, prevMessageCount])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Mark that user has typed their own message
    setHasTypedMessage(true)

    // Parse the query to extract passenger parameters
    const parsedParams = parsePassengerQuery(inputValue)

    if (parsedParams) {
      onSendMessage(inputValue, parsedParams)
      setInputValue('')
    } else {
      // If we can't parse it, show an error message
      onSendMessage(inputValue, null)
      setInputValue('')
    }
  }

  // Preset configurations (quick access chips)
  // To add a new preset, copy this pattern:
  // { id: 'unique-id', label: 'Button Text', values: { sex: 0, pclass: 1, age: 30, fare: 84 } }
  const presets = [
    { id: 'women', label: 'Women\'s path', values: { sex: 0, pclass: 2, age: 30, fare: 20 } },
    { id: 'men', label: 'Men\'s path', values: { sex: 1, pclass: 3, age: 30, fare: 13 } },
    { id: 'child', label: '1st class child', values: { sex: 0, pclass: 1, age: 5, fare: 84 } },
    { id: 'third', label: '3rd class male', values: { sex: 1, pclass: 3, age: 40, fare: 8 } }
  ]

  const handlePresetClick = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset.values)
    }
    if (onPresetChat) {
      onPresetChat(preset)
    }
  }

  // Suggestion buttons shown only when chat is empty
  const suggestionButtons = [
    "Show me a woman in 1st class",
    "What about a 3rd class male?",
    "Compare women vs men"
  ]

  // Show chips until user types their own message (clicking chips doesn't count)
  const shouldShowChips = !hasTypedMessage

  return (
    <div className="flex flex-col h-full p-6">
      {/* Chat Title */}
      <h2 className="text-lg font-semibold mb-4 text-gray-100">Ask about cohorts</h2>

      {/* Messages Area - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Ask about different passenger types to see survival statistics
          </div>
        ) : (
          messages.map((msg, idx) => {
            // Determine if this is a new message (for animation)
            const isNewMessage = idx >= prevMessageCount
            const animationClass = isNewMessage ? 'chat-message-new' : 'chat-message'

            return (
              <div key={idx} className={`text-sm ${animationClass}`}>
                {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-gray-800 text-gray-300 rounded-2xl px-4 py-2 max-w-[85%] font-medium">
                    {msg.content}
                  </div>
                </div>
              ) : msg.type === 'comparison' ? (
                // Render comparison card
                <div className="flex gap-2">
                  <span className="text-gray-400 text-base">✨</span>
                  <div className="flex-1">
                    <ComparisonCard
                      cohortA={msg.comparison.cohortA}
                      cohortB={msg.comparison.cohortB}
                      labelA={msg.comparison.labelA}
                      labelB={msg.comparison.labelB}
                      description={msg.comparison.description}
                    />
                  </div>
                </div>
              ) : msg.type === 'prediction' ? (
                // Render single prediction card
                <div className="flex gap-2">
                  <span className="text-gray-400 text-base">✨</span>
                  <div className="flex-1">
                    <SinglePredictionCard
                      passengerData={msg.passengerData}
                      label={msg.label}
                    />
                  </div>
                </div>
              ) : msg.type === 'tutorial' ? (
                // Render tutorial message with controls
                <div className="flex gap-2">
                  <span className="text-gray-400 text-base">✨</span>
                  <div className="flex-1">
                    <div className="mb-3 text-gray-100">{msg.content}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={onTutorialAdvance}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {msg.isLastStep ? 'Finish Tutorial' : 'Next'}
                      </button>
                      {!msg.isLastStep && (
                        <button
                          onClick={onTutorialSkip}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Skip
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : msg.type === 'whatif' ? (
                // Render What-If card
                <div className="flex gap-2">
                  <span className="text-gray-400 text-base">✨</span>
                  <div className="flex-1">
                    <WhatIfCard
                      values={msg.passengerData}
                      onChange={onWhatIfChange}
                      onApply={onWhatIfApply}
                    />
                  </div>
                </div>
              ) : (
                // Regular text message
                <div className="flex gap-2">
                  <span className="text-gray-400 text-base">✨</span>
                  <div className="flex-1 text-gray-100">{msg.content}</div>
                </div>
              )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Buttons - styled as chips */}
      {shouldShowChips && (
        <div className="mb-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Try asking:</p>
            <button
              onClick={() => setChipsVisible(!chipsVisible)}
              className="text-xs text-gray-500 hover:text-[#218FCE] transition-colors underline"
            >
              {chipsVisible ? 'hide' : 'show'}
            </button>
          </div>

          {chipsVisible && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestionButtons.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const parsedParams = parsePassengerQuery(suggestion)
                      if (parsedParams) {
                        onSendMessage(suggestion, parsedParams)
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-full hover:bg-[#218FCE] hover:bg-opacity-20 hover:text-[#218FCE] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Tutorial and What If chips */}
              <div className="flex gap-2">
                <button
                  onClick={onTutorialStart}
                  className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                >
                  📚 Start Tutorial
                </button>
                <button
                  onClick={onWhatIfStart}
                  className="px-3 py-1.5 text-xs bg-[#218FCE] hover:bg-[#1a7ab8] text-white rounded-full transition-colors"
                >
                  🔮 What If?
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Input Form - sticky at bottom */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about a passenger type..."
          className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-[#218FCE] text-gray-100 placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-4 py-2 text-sm bg-[#218FCE] text-white rounded hover:bg-[#1a7ab8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
