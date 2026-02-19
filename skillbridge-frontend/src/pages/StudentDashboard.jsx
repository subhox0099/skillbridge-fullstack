import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import ProjectCard from '../components/ProjectCard'
import ResumeUpload from '../components/ResumeUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import ChatBoxModal from '../components/ChatBoxModal'
import { useAuth } from '../context/AuthContext'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [applications, setApplications] = useState([])
  const [matchScores, setMatchScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ status: 'all', sort: 'newest' })
  const [chatContext, setChatContext] = useState(null)

  useEffect(() => {
    loadProjects()
    loadApplications()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
      
      // Load match scores for each project
      const scores = {}
      for (const project of response.data) {
        try {
          const matchResponse = await api.get(`/match/${project.id}`)
          const userMatch = matchResponse.data.candidates?.find(
            (c) => c.email === user?.email
          )
          if (userMatch) {
            scores[project.id] = userMatch.match_score
          }
        } catch (error) {
          // Match endpoint might not be accessible for students
          console.error(`Failed to load match score for project ${project.id}:`, error)
        }
      }
      setMatchScores(scores)
    } catch (error) {
      toast.error('Failed to load projects')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async () => {
    try {
      const response = await api.get('/applications')
      setApplications(response.data || [])
    } catch (error) {
      console.error('Failed to load applications:', error)
    }
  }

  const handleApply = () => {
    loadProjects()
    loadApplications()
  }

  const filteredProjects = useMemo(() => {
    let filtered = [...projects]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(project => project.status === filters.status)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'stipend-high':
          return (b.stipend || 0) - (a.stipend || 0)
        case 'stipend-low':
          return (a.stipend || 0) - (b.stipend || 0)
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

    return filtered
  }, [projects, searchQuery, filters])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-slideUp">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Student Dashboard</h1>
            <p className="text-gray-600 text-lg">Find your perfect internship match</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-1 inline-flex">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'projects'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Projects
        </button>
        <button
          onClick={() => {
            setActiveTab('applications')
            loadApplications()
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'applications'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📝 My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'resume'
              ? 'bg-primary-600 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📄 Resume
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="animate-fadeIn">
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects by title, description, or location..."
              />
            </div>
            <FilterBar filters={filters} onFilterChange={setFilters} />
          </div>

          {filteredProjects.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-600 mb-2">No projects found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <div key={project.id} className="animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProjectCard
                    project={project}
                    onApply={handleApply}
                    showMatchScore={true}
                    matchScore={matchScores[project.id] || 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="animate-fadeIn">
          <div className="card mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Applications</h2>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-lg mb-2">You haven't applied to any projects yet</p>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="mt-4 btn-primary"
                  >
                    Browse Projects
                  </button>
                </div>
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="card-hover">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {app.Project?.title || 'Project'}
                        </h3>
                        <p className="text-gray-600 mb-3">{app.Project?.description}</p>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                            app.status === 'SHORTLISTED' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {app.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {app.cover_letter && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{app.cover_letter}</p>
                          </div>
                        )}
                        {app.Project?.business && (
                          <div className="mt-4">
                            <button
                              onClick={() =>
                                setChatContext({
                                  project: app.Project,
                                  otherUser: app.Project.business,
                                })
                              }
                              className="btn-secondary text-sm"
                            >
                              💬 Chat with Business
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resume Tab */}
      {activeTab === 'resume' && (
        <div className="animate-fadeIn">
          <ResumeUpload />
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

export default StudentDashboard
