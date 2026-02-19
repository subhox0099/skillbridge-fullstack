import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import StarRating from './StarRating'
import ContactModal from './ContactModal'
import ViewResumeButton from './ViewResumeButton'

const ApplicationCard = ({ application, project, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const studentId = application.student_user_id || application.student?.id || application.Student?.id

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await api.patch(`/applications/${application.id}/status`, { status: newStatus })
      toast.success(`Application ${newStatus.toLowerCase()}! Email notification sent to student.`)
      if (onStatusUpdate) onStatusUpdate()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update application status')
    } finally {
      setUpdating(false)
    }
  }

  const student = application.student || application.Student

  return (
    <>
      <div className="card hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-500">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                {student?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{student?.name || 'Student'}</h3>
                <p className="text-sm text-gray-600">{student?.email}</p>
              </div>
            </div>

            {student?.average_rating > 0 && (
              <div className="mb-3">
                <StarRating rating={student.average_rating} showValue size="sm" />
              </div>
            )}

            {application.cover_letter && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                <p className="text-sm text-gray-600 line-clamp-3">{application.cover_letter}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                application.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                application.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {application.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {studentId && (
              <ViewResumeButton studentUserId={studentId} studentName={student?.name} />
            )}
            <button
              onClick={() => setShowContact(true)}
              className="btn-primary text-sm whitespace-nowrap"
            >
              Contact
            </button>
            {application.status === 'APPLIED' && (
              <>
                <button
                  onClick={() => handleStatusChange('SHORTLISTED')}
                  disabled={updating}
                  className="btn-secondary text-sm whitespace-nowrap disabled:opacity-50"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusChange('SELECTED')}
                  disabled={updating}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm whitespace-nowrap disabled:opacity-50"
                >
                  Select
                </button>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={updating}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 text-sm whitespace-nowrap disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showContact && student && (
        <ContactModal
          isOpen={showContact}
          onClose={() => setShowContact(false)}
          recipient={student}
          recipientType="student"
          projectId={project?.id}
        />
      )}
    </>
  )
}

export default ApplicationCard
