import { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * ErrorBoundary - Catches errors in child components and displays fallback UI
 * Particularly useful for D3 visualizations that might crash
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // You could also log to an error reporting service here
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="p-6 bg-red-900 bg-opacity-20 border border-red-700 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-medium mb-2">
                {this.props.errorTitle || 'Something went wrong'}
              </h3>
              <p className="text-red-300 text-sm mb-3">
                {this.props.errorMessage || 'This visualization encountered an error and could not be displayed.'}
              </p>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3 text-xs text-red-200">
                  <summary className="cursor-pointer hover:text-red-100 mb-2">
                    Error details (development only)
                  </summary>
                  <div className="mt-2 p-3 bg-red-950 bg-opacity-50 rounded border border-red-800 overflow-auto">
                    <p className="font-mono mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="text-xs whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Reset button */}
              <button
                onClick={this.handleReset}
                className="mt-3 px-4 py-2 bg-red-800 hover:bg-red-700 text-red-100 text-sm rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  errorTitle: PropTypes.string,
  errorMessage: PropTypes.string
}

export default ErrorBoundary
