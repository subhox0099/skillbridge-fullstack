import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'
import SearchBar from '../components/SearchBar'
import StudentProfileModal from '../components/StudentProfileModal'
import ApplicationCard from '../components/ApplicationCard'
import ReviewForm from '../components/ReviewForm'
import ChatBoxModal from '../components/ChatBoxModal'
import MatchScoreBar from '../components/MatchScoreBar'
import StatsCard from '../components/StatsCard'
import ProjectStatusModal from '../components/ProjectStatusModal'
import ViewResumeButton from '../components/ViewResumeButton'
import { useAuth } from '../context/AuthContext'

const BusinessDashboard = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [applications, setApplications] = useState({})
  const [selectedProject, setSelectedProject] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [reviews, setReviews] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    location: '',
    stipend: '',
    latitude: '',
    longitude: '',
    skillIds: [],
  })
  const [availableSkills, setAvailableSkills] = useState([])
  const [chatContext, setChatContext] = useState(null)

  useEffect(() => {
    loadProjects()
    loadSkills()
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get('/projects/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects')
      const userProjects = response.data.filter(p => p.business?.id === user?.id || p.business_user_id === user?.id)
      setProjects(userProjects)
      
      // Load applications for each project
      for (const project of userProjects) {
        await loadApplications(project.id)
      }
      
      // Reload stats after projects load
      await loadStats()
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async (projectId) => {
    try {
      const response = await api.get(`/applications?projectId=${projectId}`)
      setApplications(prev => ({ ...prev, [projectId]: response.data || [] }))
    } catch (error) {
      console.error('Failed to load applications:', error)
      setApplications(prev => ({ ...prev, [projectId]: [] }))
    }
  }

  const loadSkills = async () => {
    try {
      const response = await api.get('/projects')
      const allSkills = new Map()
      response.data.forEach((project) => {
        if (project.Skills) {
          project.Skills.forEach((skill) => {
            if (!allSkills.has(skill.id)) {
              allSkills.set(skill.id, skill)
            }
          })
        }
      })
      setAvailableSkills(Array.from(allSkills.values()))
    } catch (error) {
      setAvailableSkills([])
    }
  }

  const loadCandidates = async (projectId) => {
    try {
      const response = await api.get(`/match/${projectId}`)
      setCandidates(response.data.candidates || [])
      setSelectedProject(projectId)
      setActiveTab('candidates')
    } catch (error) {
      toast.error('Failed to load candidates')
    }
  }

  const loadReviews = async (projectId) => {
    try {
      const response = await api.get(`/reviews/project/${projectId}`)
      setReviews((prev) => ({ ...prev, [projectId]: response.data }))
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const projectData = {
        title: newProject.title,
        description: newProject.description,
        location: newProject.location || undefined,
        stipend: newProject.stipend ? parseFloat(newProject.stipend) : undefined,
        latitude: newProject.latitude ? parseFloat(newProject.latitude) : undefined,
        longitude: newProject.longitude ? parseFloat(newProject.longitude) : undefined,
        skillIds: newProject.skillIds,
      }

      await api.post('/projects', projectData)
      toast.success('Project created successfully!')
      setShowCreateForm(false)
      setNewProject({
        title: '',
        description: '',
        location: '',
        stipend: '',
        latitude: '',
        longitude: '',
        skillIds: [],
      })
      loadProjects()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project')
    }
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(null)
    if (selectedProject) {
      loadReviews(selectedProject)
    }
  }

  const filteredProjects = useMemo(() => {
    let filtered = [...projects]
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return filtered
  }, [projects, searchQuery])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Business Dashboard</h1>
            <p className="text-gray-600 text-lg">Manage your projects and find the best candidates</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-1 inline-flex">
        <button
          onClick={() => {
            setActiveTab('overview')
            setSelectedProject(null)
            loadStats()
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => {
            setActiveTab('projects')
            setSelectedProject(null)
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'projects'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 My Projects
        </button>
        {selectedProject && (
          <>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'candidates'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Candidates
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'applications'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📝 Applications
            </button>
          </>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Total Projects', value: stats.total, icon: '📁', color: 'primary' },
              { title: 'Open Projects', value: stats.open, icon: '🟢', color: 'green' },
              { title: 'Total Applications', value: stats.totalApplications, icon: '📝', color: 'blue' },
              { title: 'Selected Students', value: stats.selectedApplications, icon: '✅', color: 'purple' },
            ].map((item, index) => (
              <div key={item.title} className="opacity-0 animate-slideUp" style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}>
                <StatsCard title={item.title} value={item.value} icon={item.icon} color={item.color} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Project Status Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Open</span>
                  <span className="text-2xl font-bold text-green-600">{stats.open}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">In Progress</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Completed</span>
                  <span className="text-2xl font-bold text-gray-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Closed</span>
                  <span className="text-2xl font-bold text-red-600">{stats.closed}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCreateForm(true)
                    setActiveTab('projects')
                  }}
                  className="w-full btn-primary text-left flex items-center gap-3"
                >
                  <span className="text-2xl">➕</span>
                  <span>Create New Project</span>
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="w-full btn-secondary text-left flex items-center gap-3"
                >
                  <span className="text-2xl">📋</span>
                  <span>View All Projects</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('projects')
                    loadProjects()
                  }}
                  className="w-full btn-secondary text-left flex items-center gap-3"
                >
                  <span className="text-2xl">🔄</span>
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>

          {projects.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Projects</h3>
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => {
                    setSelectedProject(project.id)
                    setActiveTab('projects')
                  }}>
                    <div>
                      <p className="font-semibold text-gray-900">{project.title}</p>
                      <p className="text-sm text-gray-600">{project.status} • {applications[project.id]?.length || 0} applications</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="animate-fadeIn">
          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search your projects..."
            />
          </div>

          {filteredProjects.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-xl text-gray-600 mb-2">No projects yet</p>
              <p className="text-gray-500 mb-6">Create your first project to get started!</p>
              <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map((project, index) => (
                <div key={project.id} className="animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-hover">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>📍 {project.location || 'N/A'}</span>
                          {project.stipend && <span>💰 ₹{project.stipend}</span>}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            project.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                            project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        {project.Skills && project.Skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
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
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadCandidates(project.id)}
                        className="flex-1 btn-primary text-sm"
                      >
                        View Candidates
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(project.id)
                          setActiveTab('applications')
                          loadApplications(project.id)
                        }}
                        className="btn-secondary text-sm"
                      >
                        Applications
                      </button>
                      <button
                        onClick={() => setShowStatusModal(project)}
                        className="btn-secondary text-sm"
                      >
                        Update Status
                      </button>
                      {project.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            loadCandidates(project.id)
                            loadReviews(project.id)
                            setShowReviewForm({ projectId: project.id, revieweeId: null })
                          }}
                          className="btn-secondary text-sm"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === 'candidates' && selectedProject && (
        <div className="animate-fadeIn">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ranked Candidates</h2>
              <p className="text-gray-600">Sorted by match score</p>
            </div>
            <button
              onClick={() => {
                setActiveTab('projects')
                setSelectedProject(null)
              }}
              className="btn-secondary text-sm"
            >
              ← Back to Projects
            </button>
          </div>

          {candidates.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-500">No candidates found for this project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <div key={candidate.id} className="card-hover animate-slideUp" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {candidate.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl font-bold text-primary-600">#{index + 1}</span>
                            <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
                          </div>
                          <p className="text-gray-600">{candidate.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <ViewResumeButton
                            studentUserId={candidate.id}
                            studentName={candidate.name}
                            className="btn-secondary text-sm whitespace-nowrap inline-flex items-center gap-2"
                          />
                          <button
                            onClick={() => setSelectedStudent(candidate.id)}
                            className="btn-primary text-sm"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() =>
                              setChatContext({
                                project: projects.find((p) => p.id === selectedProject),
                                otherUser: { id: candidate.id, name: candidate.name, email: candidate.email },
                              })
                            }
                            className="btn-secondary text-sm"
                          >
                            💬 Chat
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <MatchScoreBar score={candidate.match_score || 0} />
                        </div>
                        {candidate.average_rating > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <StarRating rating={candidate.average_rating} showValue size="sm" />
                          </div>
                        )}
                        {candidate.location && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {candidate.location}
                          </div>
                        )}
                      </div>

                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && selectedProject && (
        <div className="animate-fadeIn">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Project Applications</h2>
            <button
              onClick={() => {
                setActiveTab('projects')
                setSelectedProject(null)
              }}
              className="btn-secondary text-sm"
            >
              ← Back to Projects
            </button>
          </div>

          {applications[selectedProject]?.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-500">No applications yet for this project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications[selectedProject]?.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  project={projects.find(p => p.id === selectedProject)}
                  onStatusUpdate={() => {
                    loadApplications(selectedProject)
                    loadProjects() // Refresh projects list
                  }}
                  onOpenChat={(student, project) => {
                    setChatContext({
                      project,
                      otherUser: student,
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea
                  required
                  rows="4"
                  className="input-field"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Stipend (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newProject.stipend}
                    onChange={(e) => setNewProject({ ...newProject, stipend: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="e.g., 28.6139"
                    value={newProject.latitude}
                    onChange={(e) => setNewProject({ ...newProject, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="e.g., 77.2090"
                    value={newProject.longitude}
                    onChange={(e) => setNewProject({ ...newProject, longitude: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary">
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          studentId={selectedStudent}
        />
      )}

      {/* Project Status Modal */}
      {showStatusModal && (
        <ProjectStatusModal
          isOpen={!!showStatusModal}
          onClose={() => setShowStatusModal(null)}
          project={showStatusModal}
          onUpdate={() => {
            loadProjects()
            loadStats()
          }}
        />
      )}

      {/* Review Form */}
      {showReviewForm && selectedProject && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Student to Review</h3>
            <select
              className="input-field mb-4"
              onChange={(e) => {
                const revieweeId = e.target.value
                if (revieweeId) {
                  setShowReviewForm({ projectId: showReviewForm.projectId || selectedProject, revieweeId: parseInt(revieweeId) })
                }
              }}
            >
              <option value="">Select a student...</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} ({candidate.email})
                </option>
              ))}
            </select>
          </div>
          {showReviewForm.revieweeId && (
            <ReviewForm
              projectId={showReviewForm.projectId || selectedProject}
              revieweeId={showReviewForm.revieweeId}
              onSuccess={handleReviewSuccess}
            />
          )}
        </div>
      )}

      {/* Chat Modal */}
      {chatContext && (
        <ChatBoxModal
          isOpen={!!chatContext}
          onClose={() => setChatContext(null)}
          project={chatContext.project}
          otherUser={chatContext.otherUser}
        />
      )}
    </div>
  )
}

export default BusinessDashboard
