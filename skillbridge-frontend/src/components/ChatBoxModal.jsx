import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import getSocket from '../services/socket'

const ChatBoxModal = ({ isOpen, onClose, project, otherUser }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)
  const scrollRef = useRef(null)
  const socketRef = useRef(null)

  // Initialize Socket.IO connection and join chat room
  useEffect(() => {
    if (!isOpen || !project || !otherUser) {
      // Clean up when modal closes
      if (socketRef.current) {
        socketRef.current.emit('leave_chat')
        socketRef.current.removeAllListeners()
        socketRef.current = null
      }
      setMessages([])
      return
    }

    setLoading(true)
    setMessages([])
    const socket = getSocket()

    if (!socket) {
      toast.error('Unable to connect to chat. Please login again.')
      setLoading(false)
      return
    }

    socketRef.current = socket

    // Handle connection status
    const onConnect = () => {
      console.log('Socket connected, joining chat room')
      setConnected(true)
      socket.emit('join_chat', {
        projectId: project.id,
        otherUserId: otherUser.id,
      })
    }

    const onDisconnect = () => {
      console.log('Socket disconnected')
      setConnected(false)
    }

    // Handle chat history when joining room
    const onChatHistory = ({ messages: historyMessages }) => {
      console.log('Received chat history:', historyMessages?.length || 0, 'messages')
      setMessages(historyMessages || [])
      setLoading(false)
    }

    // Handle new messages (real-time)
    const onNewMessage = ({ message }) => {
      console.log('📨 New message received:', message)
      console.log('   Current user ID:', user?.id)
      console.log('   Message sender ID:', message.sender_user_id)
      console.log('   Message recipient ID:', message.recipient_user_id)
      
      setMessages((prev) => {
        // Avoid duplicates by checking ID
        const exists = prev.some((m) => m.id === message.id || (m.id === message.id && m.text === message.text))
        if (exists) {
          console.log('   ⚠️ Duplicate message ignored')
          return prev
        }
        console.log('   ✅ Adding new message to chat')
        return [...prev, message]
      })
    }

    // Handle errors
    const onError = ({ message: errorMsg }) => {
      console.error('Socket error:', errorMsg)
      toast.error(errorMsg || 'Chat error occurred')
      setLoading(false)
    }

    // Remove any existing listeners first
    socket.off('connect', onConnect)
    socket.off('disconnect', onDisconnect)
    socket.off('chat_history', onChatHistory)
    socket.off('new_message', onNewMessage)
    socket.off('error', onError)

    // Register event listeners
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('chat_history', onChatHistory)
    socket.on('new_message', onNewMessage)
    socket.on('error', onError)

    // Set connection status and join if already connected
    if (socket.connected) {
      setConnected(true)
      socket.emit('join_chat', {
        projectId: project.id,
        otherUserId: otherUser.id,
      })
    } else {
      setConnected(false)
      // Wait for connection
      socket.once('connect', () => {
        setConnected(true)
        socket.emit('join_chat', {
          projectId: project.id,
          otherUserId: otherUser.id,
        })
      })
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (socket) {
        socket.off('connect', onConnect)
        socket.off('disconnect', onDisconnect)
        socket.off('chat_history', onChatHistory)
        socket.off('new_message', onNewMessage)
        socket.off('error', onError)
        socket.emit('leave_chat')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project?.id, otherUser?.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!isOpen || !project || !otherUser) return null

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return

    const socket = socketRef.current
    if (!socket) {
      toast.error('Chat not initialized. Please close and reopen.')
      return
    }

    if (!socket.connected) {
      toast.error('Not connected to chat. Please wait...')
      return
    }

    setSending(true)
    const tempId = Date.now()
    
    // Optimistically add message to UI
    const tempMessage = {
      id: tempId,
      text,
      sender_user_id: user?.id,
      recipient_user_id: otherUser.id,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMessage])
    setInput('')

    try {
      console.log('📤 Sending message:', {
        projectId: project.id,
        recipientUserId: otherUser.id,
        text,
        currentUserId: user?.id
      })
      
      socket.emit('send_message', {
        projectId: project.id,
        recipientUserId: otherUser.id,
        text,
      })
      
      // Wait a bit, then remove temp message if real one hasn't arrived
      setTimeout(() => {
        setMessages((prev) => {
          const hasRealMessage = prev.some((m) => m.text === text && m.id !== tempId)
          if (hasRealMessage) {
            return prev.filter((m) => m.id !== tempId)
          }
          return prev
        })
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error sending message:', error)
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col max-h-[80vh] animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                {otherUser.name?.charAt(0).toUpperCase() || 'U'}
              </span>
              <span>{otherUser.name || otherUser.email}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
              Project: {project.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Connection Status */}
        <div className={`px-4 py-2 border-b text-xs flex items-center gap-2 ${
          connected 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
          }`}></span>
          {connected ? 'Connected - Real-time chat active' : 'Connecting to chat...'}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-gray-500 text-sm">
              <div className="text-3xl mb-2">💬</div>
              <p>Start the conversation for this project.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => {
                const isMe = msg.sender_user_id === user?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? 'text-primary-100/80' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 max-h-24"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatBoxModal

