import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ResumeUpload = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadParsedResume()
  }, [])

  const loadParsedResume = async () => {
    try {
      const response = await api.get('/resume/parsed')
      if (response.data.parsed_resume_data) {
        setParsedData(response.data.parsed_resume_data)
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to load parsed resume:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await api.post('/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      toast.success(`Resume parsed! ${response.data.skills_added} skills added.`)
      setParsedData(response.data.parsed)
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('resume-file')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="card">Loading...</div>
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">Resume Upload & Parsing</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="resume-file" className="label">
            Upload PDF Resume
          </label>
          <input
            id="resume-file"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="input-field"
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum file size: 5MB. Only PDF files are accepted.
          </p>
        </div>

        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">{file.name}</span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload & Parse'}
            </button>
          </div>
        )}

        {parsedData && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold mb-3">Parsed Resume Data</h4>
            
            {parsedData.skills && parsedData.skills.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Extracted Skills:</h5>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsedData.education && parsedData.education.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Education:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {parsedData.education.map((edu, idx) => (
                    <li key={idx}>{edu.text}</li>
                  ))}
                </ul>
              </div>
            )}

            {parsedData.experience && parsedData.experience.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Experience:</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {parsedData.experience.map((exp, idx) => (
                    <li key={idx}>{exp.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeUpload
