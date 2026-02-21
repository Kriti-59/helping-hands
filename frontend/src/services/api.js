import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  // User registration
  registerUser: (data) => api.post('/api/auth/register', data),
  
  // Volunteer registration
  registerVolunteer: (data) => api.post('/api/auth/register/volunteer', data),
  
  // Universal login
  login: (data) => api.post('/api/auth/login', data),
  
  // Logout
  logout: () => api.post('/api/auth/logout'),
}


export default api  