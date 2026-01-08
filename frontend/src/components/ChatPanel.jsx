import { useState, useRef, useEffect } from 'react'
import { parsePassengerQuery } from '../utils/cohortPatterns'
import { UI_COLORS } from '../utils/uiStyles'
import ComparisonCard from './ComparisonCard'
import SinglePredictionCard from './SinglePredictionCard'
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
 * @param {Function} onEditCard - Callback when Edit button clicked on a card
 * @param {Function} onHighlightCohort - Callback when percentage clicked to highlight path
 * @param {number} activeMessageIndex - Index of the message currently being displayed in visualizations
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
 *   onHighlightCohort={(cohort, comparison, msgIdx) => handleHighlightCohort(cohort, comparison, msgIdx)}
 *   activeMessageIndex={0}
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
function ChatPanel({ messages, onSendMessage, onPresetSelect, onPresetChat, onTutorialAdvance, onTutorialSkip, onTutorialStart, onWhatIfStart, onEditCard, onHighlightCohort, activeMessageIndex }) {
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
    <div className="flex flex-col h-full p-6" style={{ backgroundColor: UI_COLORS.chatAreaBg }}>
      {/* Chat Title */}
      <h2 className="text-lg font-semibold mb-4 text-gray-100">Ask about cohorts</h2>

      {/* Messages Area - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Ask about different passenger types to see survival statistics
          </div>
        ) : (
          (() => {
            // Group messages into sections (user request + assistant response(s))
            const sections = []
            let currentSection = []

            messages.forEach((msg, idx) => {
              if (msg.role === 'user') {
                // Start a new section
                if (currentSection.length > 0) {
                  sections.push(currentSection)
                }
                currentSection = [msg]
              } else {
                // Add to current section
                currentSection.push(msg)
              }
            })

            // Add the last section
            if (currentSection.length > 0) {
              sections.push(currentSection)
            }

            return sections.map((section, sectionIdx) => {
              // Check if this section contains the active message
              const containsActiveMessage = section.some(msg => messages.indexOf(msg) === activeMessageIndex)
              const sectionBg = containsActiveMessage ? UI_COLORS.chatSectionBgLatest : UI_COLORS.chatSectionBgPrevious

              return (
                <div
                  key={sectionIdx}
                  className="rounded-lg p-3 space-y-3"
                  style={{ backgroundColor: sectionBg }}
                >
                  {section.map((msg, msgIdx) => {
                    const globalIdx = messages.indexOf(msg)
                    const isNewMessage = globalIdx >= prevMessageCount
                    const animationClass = isNewMessage ? 'chat-message-new' : 'chat-message'

                    return (
                      <div key={msgIdx} className={`text-sm ${animationClass}`}>
                        {msg.role === 'user' ? (
                          <div className="flex justify-end">
                            <div className="rounded-2xl px-4 py-2 max-w-[85%] font-medium" style={{ backgroundColor: UI_COLORS.chatBubbleUser, color: UI_COLORS.chatBubbleUserText }}>
                              {msg.content}
                            </div>
                          </div>
                        ) : msg.type === 'comparison' ? (
                          // Render comparison card
                          <ComparisonCard
                            cohortA={msg.comparison.cohortA}
                            cohortB={msg.comparison.cohortB}
                            labelA={msg.comparison.labelA}
                            labelB={msg.comparison.labelB}
                            description={msg.comparison.description}
                            onEdit={onEditCard ? () => onEditCard({ comparison: msg.comparison }) : null}
                            onHighlightCohort={onHighlightCohort}
                            messageIndex={globalIdx}
                          />
                        ) : msg.type === 'prediction' ? (
                          // Render single prediction card
                          <SinglePredictionCard
                            passengerData={msg.passengerData}
                            label={msg.label}
                            onEdit={onEditCard ? () => onEditCard({ passengerData: msg.passengerData }) : null}
                            onHighlightCohort={onHighlightCohort}
                            messageIndex={globalIdx}
                          />
                        ) : msg.type === 'tutorial' ? (
                          // Render tutorial message with controls
                          <div className="flex gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-6 h-6"
                              style={{ color: UI_COLORS.chatIconColor }}
                              aria-hidden="true"
                            >
                              <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <div className="mb-3 text-gray-100">{msg.content}</div>
                              <div className="flex gap-2">
                                <button
                                  onClick={onTutorialAdvance}
                                  className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                                  style={{ backgroundColor: UI_COLORS.buttonPrimaryBg, color: UI_COLORS.buttonPrimaryText }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBgHover)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBg)}
                                >
                                  {msg.isLastStep ? 'Finish Tutorial' : 'Next'}
                                </button>
                                {!msg.isLastStep && (
                                  <button
                                    onClick={onTutorialSkip}
                                    className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
                                    style={{ backgroundColor: UI_COLORS.buttonTertiaryBg, color: UI_COLORS.buttonTertiaryText }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonTertiaryBgHover)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonTertiaryBg)}
                                  >
                                    Skip
                                  </button>
                                )}
                              </div>
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
                  })}
                </div>
              )
            })
          })()
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Buttons - styled as chips */}
      {shouldShowChips && (
        <div className="mb-3 pt-3 border-t" style={{ borderColor: UI_COLORS.chatDivider }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs" style={{ color: UI_COLORS.chatHintText }}>Try asking:</p>
            <button
              onClick={() => setChipsVisible(!chipsVisible)}
              className="text-xs transition-colors underline"
              style={{ color: UI_COLORS.chatHintText }}
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
                      className="px-3 py-1.5 text-xs rounded-full transition-colors"
                      style={{ backgroundColor: UI_COLORS.chipBg, color: UI_COLORS.chipText }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = UI_COLORS.chipBgHover; e.currentTarget.style.color = UI_COLORS.chipTextHover }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = UI_COLORS.chipBg; e.currentTarget.style.color = UI_COLORS.chipText }}
                    >
                      {suggestion}
                    </button>
                ))}
              </div>

              {/* Tutorial chip */}
              <div className="flex gap-2">
                <button
                  onClick={onTutorialStart}
                  className="px-3 py-1.5 text-xs text-white rounded-full transition-colors"
                  style={{ backgroundColor: UI_COLORS.buttonPrimaryBg }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBgHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBg)}
                >
                  📚 Start Tutorial
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
          className="flex-1 px-3 py-2 text-sm rounded outline-none"
          style={{
            backgroundColor: UI_COLORS.inputBg,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: UI_COLORS.inputBorder,
            color: UI_COLORS.inputText
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = UI_COLORS.inputBorderFocus)}
          onBlur={(e) => (e.currentTarget.style.borderColor = UI_COLORS.inputBorder)}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="px-4 py-2 text-sm text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: UI_COLORS.buttonPrimaryBg
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBgHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = UI_COLORS.buttonPrimaryBg)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
