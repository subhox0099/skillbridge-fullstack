import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/StudentDashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import Profile from './pages/Profile'
import AboutPage from './pages/AboutPage'
import PrivateRoute from './components/PrivateRoute'
import LoadingSpinner from './components/LoadingSpinner'
import ScrollToTop from './components/ScrollToTop'
import AppFooter from './components/AppFooter'

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/dashboard" element={<DashboardRoute />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
                <AppFooter variant="light" />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  )
}

function DashboardRoute() {
  const { user } = useAuth()
  const role = user?.role

  if (role === 'Student') {
    return <StudentDashboard />
  }
  if (role === 'Business' || role === 'Admin') {
    return <BusinessDashboard />
  }
  // If authenticated but role missing/unexpected, show student dashboard to avoid redirect loop
  if (user) {
    return <StudentDashboard />
  }
  return <Navigate to="/login" replace />
}

export default App
