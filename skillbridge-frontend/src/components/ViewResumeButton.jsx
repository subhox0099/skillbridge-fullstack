import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ViewResumeButton = ({ studentUserId, studentName, className = '' }) => {
  const [loading, setLoading] = useState(false)

  const handleViewResume = async () => {
    if (!studentUserId) return
    setLoading(true)
    try {
      const response = await api.get(`/resume/student/${studentUserId}`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      if (newWindow) {
        newWindow.focus()
      } else {
        toast.error('Please allow pop-ups to view the resume')
      }
      // Revoke after a delay so the new tab can load it
      setTimeout(() => window.URL.revokeObjectURL(url), 60000)
    } catch (error) {
      const message = error.response?.data?.message || error.response?.status === 404
        ? 'Student has not uploaded a resume'
        : 'Failed to load resume'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleViewResume}
      disabled={loading}
      className={className || 'btn-secondary text-sm whitespace-nowrap disabled:opacity-50 inline-flex items-center gap-2'}
      title="View student's resume"
    >
      {loading ? (
        <>
          <span className="animate-spin inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full" />
          Loading...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          View Resume
        </>
      )}
    </button>
  )
}

export default ViewResumeButton
