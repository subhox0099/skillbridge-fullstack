const MatchScoreBar = ({ score }) => {
  const percentage = Math.min(100, Math.max(0, score))
  const colorClass =
    percentage >= 80 ? 'bg-green-500' :
    percentage >= 60 ? 'bg-blue-500' :
    percentage >= 40 ? 'bg-yellow-500' :
    'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Match Score</span>
        <span className="text-sm font-semibold text-gray-900">{score.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default MatchScoreBar
