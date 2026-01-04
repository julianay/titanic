import WhatIfCard from './WhatIfCard'

/**
 * WhatIfModal - Modal wrapper for the What If card
 *
 * Displays the WhatIfCard in a centered modal with backdrop
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Callback when modal should close
 * @param {Object} values - Current passenger parameter values
 * @param {Function} onChange - Callback when control changes
 * @param {Function} onApply - Callback when Apply button clicked
 * @param {Function} onCompare - Optional callback when Compare button clicked
 * @param {Object} initialComparisonData - Optional initial comparison data {cohortA, cohortB}
 */
function WhatIfModal({ isOpen, onClose, values, onChange, onApply, onCompare, initialComparisonData }) {
  if (!isOpen) return null

  const handleApply = () => {
    onApply()
    onClose()
  }

  const handleCompare = (...args) => {
    if (onCompare) {
      onCompare(...args)
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="max-w-lg w-full mx-4">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full flex items-center justify-center transition-colors z-10"
            title="Close"
          >
            ×
          </button>

          {/* WhatIfCard */}
          <WhatIfCard
            values={values}
            onChange={onChange}
            onApply={handleApply}
            onCompare={onCompare ? handleCompare : undefined}
            initialComparisonData={initialComparisonData}
          />
        </div>
      </div>
    </div>
  )
}

export default WhatIfModal
