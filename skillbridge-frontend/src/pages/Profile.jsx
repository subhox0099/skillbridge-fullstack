import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'

const Profile = () => {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState({
    location: '',
    latitude: '',
    longitude: '',
  })
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
    if (authUser?.role === 'Student') {
      loadReviews()
    }
  }, [authUser])

  const loadProfile = async () => {
    try {
      // Get user data from auth context or fetch from API
      const userData = JSON.parse(localStorage.getItem('user'))
      setProfile({
        location: userData?.location || '',
        latitude: userData?.latitude || '',
        longitude: userData?.longitude || '',
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/user/${authUser.id}`)
      setReviews(response.data)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = {
        location: profile.location || undefined,
        latitude: profile.latitude ? parseFloat(profile.latitude) : undefined,
        longitude: profile.longitude ? parseFloat(profile.longitude) : undefined,
      }

      const response = await api.patch('/profile', updateData)
      
      // Update localStorage user data
      const userData = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        ...response.data,
      }))

      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{authUser?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{authUser?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="text-gray-900">{authUser?.role}</p>
              </div>
              {authUser?.role === 'Student' && authUser?.average_rating > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Average Rating</label>
                  <div className="mt-1">
                    <StarRating rating={authUser.average_rating} showValue />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Location Settings</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="location" className="label">
                  Location (City/Address)
                </label>
                <input
                  id="location"
                  type="text"
                  className="input-field"
                  placeholder="e.g., Lucknow, Uttar Pradesh"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="label">
                    Latitude (Optional)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="e.g., 28.6139"
                    value={profile.latitude}
                    onChange={(e) => setProfile({ ...profile, latitude: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    For accurate distance matching
                  </p>
                </div>
                <div>
                  <label htmlFor="longitude" className="label">
                    Longitude (Optional)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="e.g., 77.2090"
                    value={profile.longitude}
                    onChange={(e) => setProfile({ ...profile, longitude: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {authUser?.role === 'Student' && reviews.length > 0 && (
          <div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Reviews Received</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.reviewer?.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-600">{review.Project?.title}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
