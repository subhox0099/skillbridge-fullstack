import { useState, useEffect } from 'react'

const EmailStatusBadge = ({ email, status = 'pending' }) => {
  const [currentStatus, setCurrentStatus] = useState(status)

  useEffect(() => {
    setCurrentStatus(status)
  }, [status])

  const statusConfig = {
    sent: { color: 'bg-green-100 text-green-800', icon: '✓', text: 'Sent' },
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', text: 'Pending' },
    failed: { color: 'bg-red-100 text-red-800', icon: '✗', text: 'Failed' },
  }

  const config = statusConfig[currentStatus] || statusConfig.pending

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  )
}

export default EmailStatusBadge
