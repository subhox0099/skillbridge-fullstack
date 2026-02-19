const LiveIndicator = ({ label = 'Live', pulse = true }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
    <span className={`relative flex h-2 w-2 ${pulse ? 'animate-ping-once' : ''}`}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
    </span>
    {label}
  </span>
)

export default LiveIndicator
