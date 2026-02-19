import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import StarRating from './StarRating'
import ContactModal from './ContactModal'
import LoadingSpinner from './LoadingSpinner'

const StudentProfileModal = ({ isOpen, onClose, studentId }) => {
  const [student, setStudent] = useState(null)
  const [reviews, setReviews] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    if (isOpen && studentId) {
      loadStudentProfile()
    }
  }, [isOpen, studentId])

  const loadStudentProfile = async () => {
    setLoading(true)
    try {
      // Load student details, reviews, and skills
      // Note: You'll need to create these endpoints in the backend
      const [reviewsRes, projectsRes] = await Promise.all([
        api.get(`/reviews/user/${studentId}`).catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] })),
      ])

      // Find student from candidates in projects
      let studentData = null
      for (const project of projectsRes.data) {
        try {
          const matchRes = await api.get(`/match/${project.id}`)
          const candidate = matchRes.data.candidates?.find(c => c.id === studentId)
          if (candidate) {
            studentData = candidate
            break
          }
        } catch (e) {
          continue
        }
      }

      if (studentData) {
        setStudent(studentData)
        setSkills(studentData.skills || [])
      }
      setReviews(reviewsRes.data || [])
    } catch (error) {
      toast.error('Failed to load student profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 animate-fadeIn">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowContact(true)}
                className="btn-primary text-sm"
              >
                Contact Student
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <LoadingSpinner />
            ) : student ? (
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {student.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h3>
                    <p className="text-gray-600 mb-3">{student.email}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {student.location && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{student.location}</span>
                        </div>
                      )}
                      {student.average_rating > 0 && (
                        <div className="flex items-center gap-2">
                          <StarRating rating={student.average_rating} showValue size="md" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                {skills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                {reviews.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Reviews</h4>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.reviewer?.name || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-600">{review.Project?.title}</p>
                            </div>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reviews.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Student profile not found
              </div>
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
        />
      )}
    </>
  )
}

export default StudentProfileModal
