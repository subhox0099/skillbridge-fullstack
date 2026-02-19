import { useState, useEffect } from 'react'
import api from '../services/api'
import NotificationCenter from './NotificationCenter'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showCenter, setShowCenter] = useState(false)
  const [justUpdated, setJustUpdated] = useState(false)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/notifications?unreadOnly=true&limit=1')
      const count = response.data.unreadCount || 0
      if (count !== unreadCount) setJustUpdated(true)
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load notification count:', error)
    }
  }

  useEffect(() => {
    if (!justUpdated) return
    const t = setTimeout(() => setJustUpdated(false), 600)
    return () => clearTimeout(t)
  }, [justUpdated, unreadCount])

  return (
    <>
      <button
        onClick={() => setShowCenter(true)}
        className="relative p-2.5 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <svg
          className="w-6 h-6 transition-transform duration-300 hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-md transition-transform duration-300 ${justUpdated ? 'animate-bounce-in scale-110' : 'animate-notification-pop'}`}
          >
            {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter isOpen={showCenter} onClose={() => setShowCenter(false)} />
    </>
  )
}

export default NotificationBell
