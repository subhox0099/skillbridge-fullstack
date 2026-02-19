const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-transparent border-b-primary-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
      <p className="text-gray-500 text-sm font-medium animate-pulse-soft">Loading...</p>
    </div>
  )
}

export default LoadingSpinner
