import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // #region agent log
    const url = (config.baseURL || '') + (config.url || '')
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'api.js:request', message: 'api request', data: { url, hasToken: !!token }, timestamp: Date.now(), hypothesisId: 'H4' }) }).catch(() => {})
    // #endregion
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    // #region agent log
    fetch('http://127.0.0.1:7608/ingest/c5cf458e-c2c6-46e4-bd58-857b266fc38b', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a8bb41' }, body: JSON.stringify({ sessionId: 'a8bb41', location: 'api.js:response', message: 'api error', data: { status, url: error.config?.url }, timestamp: Date.now(), hypothesisId: 'H4' }) }).catch(() => {})
    // #endregion
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    }
    return Promise.reject(error)
  }
)

export default api
