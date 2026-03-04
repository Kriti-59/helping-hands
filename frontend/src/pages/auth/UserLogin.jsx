import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function UserLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { token, user_id, user_type, name, email } = response.data

      // Check if actually a user (not volunteer/org)
      if (user_type !== 'user') {
        setError('Please use the volunteer login page')
        setLoading(false)
        return
      }

      // Save to auth context
      login({ user_id, user_type, name, email }, token)

      // Redirect to dashboard
      navigate('/dashboard')
      
    } catch (err) {
      console.error('Login error:', err)
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">Helping Hands</span>
        </Link>
        <h2 className="text-center text-3xl font-bold text-slate-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Sign in to submit a help request
        </p>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Demo Account */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-2">Demo Account:</p>
            <p className="text-xs text-blue-700">
              <strong>Email:</strong> user@email.com<br />
              <strong>Password:</strong> password
            </p>
          </div>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="w-full btn-outline block text-center"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Volunteer Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Are you a volunteer?{' '}
              <Link to="/volunteer/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Volunteer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}