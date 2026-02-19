import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ContactModal = ({ isOpen, onClose, recipient, recipientType, projectId = null }) => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setSending(true)
    try {
      // In a real app, this would send to a messaging API endpoint
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Message sent to ${recipient?.name || recipient?.email}!`)
      setSubject('')
      setMessage('')
      onClose()
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Contact {recipientType === 'student' ? 'Student' : 'Business'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">To:</p>
          <p className="font-semibold text-gray-900">{recipient?.name}</p>
          <p className="text-sm text-gray-600">{recipient?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Interview invitation for Project..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Message</label>
            <textarea
              required
              rows="6"
              className="input-field"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={sending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContactModal
