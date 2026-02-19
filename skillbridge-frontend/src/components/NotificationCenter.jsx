import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  APPLICATION_SUBMITTED: { icon: '📩', label: 'Application', bg: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  NEW_APPLICATION: { icon: '✨', label: 'New application', bg: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
  APPLICATION_STATUS_UPDATE: { icon: '🔄', label: 'Status update', bg: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  REVIEW_RECEIVED: { icon: '⭐', label: 'Review', bg: 'bg-violet-100 text-violet-700', border: 'border-violet-200' },
  CHAT_MESSAGE: { icon: '💬', label: 'Chat message', bg: 'bg-sky-100 text-sky-700', border: 'border-sky-200' },
}

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || { icon: '🔔', label: type || 'Notification', bg: 'bg-gray-100 text-gray-700', border: 'border-gray-200' }
}

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    try {
      console.log('Loading notifications...')
      const response = await api.get('/notifications')
      console.log('Notifications response:', response.data)
      
      // Handle both possible response structures
      const notifications = response.data.notifications || response.data || []
      const unreadCount = response.data.unreadCount !== undefined 
        ? response.data.unreadCount 
        : notifications.filter(n => !n.is_read).length
      
      setNotifications(Array.isArray(notifications) ? notifications : [])
      setUnreadCount(unreadCount)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || 'Could not load notifications')
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('All marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => Math.max(0, prev - (notifications.find(n => n.id === id)?.is_read ? 0 : 1)))
      toast.success('Notification removed')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[55] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      {/* Backdrop with fade */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer from right */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col max-h-full animate-slide-in-right border-l border-gray-200 z-[60]">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              🔔
            </div>
            <div>
              <h2 className="text-xl font-bold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1 mt-0.5 text-primary-100 text-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-12 h-12 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
              <div className="text-5xl mb-4 animate-float">🔔</div>
              <p className="text-gray-600 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">We’ll notify you when something happens.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification, index) => {
                const config = getTypeConfig(notification.type)
                const isUnread = !notification.is_read
                return (
                  <li
                    key={notification.id}
                    className={`animate-notification-pop rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${isUnread ? `bg-primary-50/80 border-primary-200 ${config.border}` : 'bg-gray-50/80 border-gray-200 hover:border-gray-300'}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex gap-3">
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.bg}`}>
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold uppercase tracking-wide ${isUnread ? 'text-primary-600' : 'text-gray-500'}`}>
                            {config.label}
                          </span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[15px] text-gray-900 mt-1 leading-relaxed break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {isUnread && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-primary-600 hover:text-primary-700 text-xs font-medium py-1 px-2 rounded-lg hover:bg-primary-100 transition-colors"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-500 hover:text-red-600 text-xs font-medium py-1 px-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter
