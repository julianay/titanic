function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: UI_COLORS.accent }}></div>
      </div>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}

export default LoadingSpinner
