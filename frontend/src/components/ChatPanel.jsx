import { useState, useRef, useEffect } from 'react'
import { parsePassengerQuery } from '../utils/cohortPatterns'

function ChatPanel({ messages, onSendMessage }) {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  const suggestionButtons = [
    "Show me a woman in 1st class",
    "What about a 3rd class male?",
    "First class child"
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-64">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Ask about different passenger types to see survival statistics
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-100'}`}>
              <div className={`${msg.role === 'user' ? 'font-medium text-[#218FCE]' : ''}`}>
                {msg.role === 'user' ? '> ' : ''}
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Buttons */}
      {messages.length === 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-xs text-gray-500">Try asking:</p>
          <div className="space-y-1">
            {suggestionButtons.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const parsedParams = parsePassengerQuery(suggestion)
                  if (parsedParams) {
                    onSendMessage(suggestion, parsedParams)
                  }
                }}
                className="w-full text-left px-3 py-2 text-xs bg-gray-800 hover:bg-[#218FCE] hover:bg-opacity-20 hover:text-[#218FCE] rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
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
