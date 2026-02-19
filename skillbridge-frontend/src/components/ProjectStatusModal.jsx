import { useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ProjectStatusModal = ({ isOpen, onClose, project, onUpdate }) => {
  const [status, setStatus] = useState(project?.status || 'OPEN')
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      await api.patch(`/projects/${project.id}/status`, { status })
      toast.success('Project status updated successfully!')
      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project status')
    } finally {
      setUpdating(false)
    }
  }

  if (!isOpen) return null

  const statusOptions = [
    { value: 'OPEN', label: 'Open', color: 'green' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
    { value: 'COMPLETED', label: 'Completed', color: 'gray' },
    { value: 'CLOSED', label: 'Closed', color: 'red' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Project Status</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Project: <strong>{project?.title}</strong></p>
        </div>

        <div className="space-y-2 mb-6">
          {statusOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                status === option.value
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={status === option.value}
                onChange={(e) => setStatus(e.target.value)}
                className="mr-3"
              />
              <span className="font-medium">{option.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUpdate}
            disabled={updating}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectStatusModal
