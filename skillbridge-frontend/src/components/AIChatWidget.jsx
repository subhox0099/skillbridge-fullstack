import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const AIChatWidget = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi ${user?.name || 'there'}! I'm the SkillBridge Assistant. Ask me how to use the platform – applying, projects, matching, resumes, notifications, or chat.`,
        },
      ])
    }
  }, [isOpen, messages.length, user])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleToggle = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const userMessage = { id: Date.now(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const response = await api.post('/ai/chat', { message: text })
      const reply = response.data?.reply || 'Sorry, I could not generate a response.'
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: reply,
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          content: 'Something went wrong while contacting the assistant. Please try again.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary-600 text-white w-12 h-12 flex items-center justify-center shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
        aria-label="Open SkillBridge assistant"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-xl">🤖</span>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-slideUp">
          <div className="px-4 py-3 bg-primary-600 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">SkillBridge Assistant</p>
              <p className="text-xs text-primary-100">Ask how to use the platform</p>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 px-3 py-2 bg-gray-50 overflow-y-auto max-h-80">
            {messages.length === 0 ? (
              <div className="text-sm text-gray-500 py-6 text-center">
                Start a conversation with the assistant.
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={handleSend} className="px-3 py-2 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-3 py-1.5 rounded-full bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default AIChatWidget

