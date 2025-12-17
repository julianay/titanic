import PropTypes from 'prop-types'

/**
 * LoadingSkeleton - Modern skeleton loader for better UX than spinners
 * Shows placeholder shapes that match the content being loaded
 */
function LoadingSkeleton({ variant = 'card', count = 1, className = '' }) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        // For prediction cards
        return (
          <div className={`animate-pulse space-y-4 p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg ${className}`}>
            <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="h-16 bg-gray-700 rounded w-2/3 mx-auto"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        )

      case 'tree':
        // For decision tree visualization
        return (
          <div className={`animate-pulse space-y-6 ${className}`}>
            <div className="h-96 bg-gray-700 rounded-lg"></div>
          </div>
        )

      case 'chart':
        // For SHAP charts
        return (
          <div className={`animate-pulse space-y-3 ${className}`}>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-700 rounded"></div>
              <div className="h-8 bg-gray-700 rounded w-5/6"></div>
              <div className="h-8 bg-gray-700 rounded w-4/6"></div>
              <div className="h-8 bg-gray-700 rounded w-3/6"></div>
            </div>
          </div>
        )

      case 'comparison':
        // For comparison summary
        return (
          <div className={`animate-pulse space-y-4 p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg ${className}`}>
            <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto"></div>
            <div className="h-12 bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
          </div>
        )

      case 'text':
        // Generic text lines
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        )

      default:
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-700 rounded"></div>
          </div>
        )
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  )
}

LoadingSkeleton.propTypes = {
  variant: PropTypes.oneOf(['card', 'tree', 'chart', 'comparison', 'text']),
  count: PropTypes.number,
  className: PropTypes.string
}

export default LoadingSkeleton
