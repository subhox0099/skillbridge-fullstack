import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import MatchScoreBar from './MatchScoreBar'
import StarRating from './StarRating'

const ProjectCard = ({ project, onApply, showMatchScore = false, matchScore = null }) => {
  const { user } = useAuth()
  const [applying, setApplying] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error('Please enter a cover letter')
      return
    }

    setApplying(true)
    try {
      await api.post('/applications', {
        projectId: project.id,
        coverLetter,
      })
      toast.success('Application submitted successfully!')
      setShowCoverLetter(false)
      setCoverLetter('')
      if (onApply) onApply()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="card-hover">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{project.description}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Location:</span>
          <span className="ml-2">{project.location || 'Not specified'}</span>
        </div>
        
        {project.stipend && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Stipend:</span>
            <span className="ml-2 text-green-600 font-semibold">₹{project.stipend}</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Status:</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            project.status === 'OPEN' ? 'bg-green-100 text-green-800' :
            project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status}
          </span>
        </div>

        {project.Skills && project.Skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {project.Skills.map((skill) => (
              <span
                key={skill.id}
                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {showMatchScore && matchScore !== null && (
        <div className="mb-4">
          <MatchScoreBar score={matchScore} />
        </div>
      )}

      {user?.role === 'Student' && project.status === 'OPEN' && (
        <div>
          {!showCoverLetter ? (
            <button
              onClick={() => setShowCoverLetter(true)}
              className="w-full btn-primary"
            >
              Apply Now
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                className="input-field"
                rows="4"
                placeholder="Write your cover letter..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  onClick={() => {
                    setShowCoverLetter(false)
                    setCoverLetter('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectCard
