import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function UserRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
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

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Register user
      const registerResponse = await authAPI.registerUser(formData)
      console.log('User registered:', registerResponse.data)

      // Auto-login after registration
      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password
      })

      const { token, user_id, user_type, name, email } = loginResponse.data

      // Save to auth context
      login({ user_id, user_type, name, email }, token)

      // Redirect to dashboard
      navigate('/dashboard')
      
    } catch (err) {
      console.error('Registration error:', err)
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <svg className="hero-corner-lines" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          {/* Define gradient that fades at ends */}
          <defs>
            <linearGradient id="fadeTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3a3228" stopOpacity="0"/>
              <stop offset="15%" stopColor="#3a3228" stopOpacity="1"/>
              <stop offset="85%" stopColor="#3a3228" stopOpacity="0"/>
              <stop offset="100%" stopColor="#3a3228" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fadeTopThin" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6a6258" stopOpacity="0"/>
              <stop offset="15%" stopColor="#6a6258" stopOpacity="1"/>
              <stop offset="85%" stopColor="#6a6258" stopOpacity="1"/>
              <stop offset="100%" stopColor="#6a6258" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fadeBottom" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4a6a7a" stopOpacity="0"/>
              <stop offset="15%" stopColor="#4a6a7a" stopOpacity="1"/>
              <stop offset="85%" stopColor="#4a6a7a" stopOpacity="1"/>
              <stop offset="100%" stopColor="#4a6a7a" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="fadeBottomThin" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#304651" stopOpacity="0"/>
              <stop offset="15%" stopColor="#304651" stopOpacity="1"/>
              <stop offset="85%" stopColor="#304651" stopOpacity="1"/>
              <stop offset="100%" stopColor="#304651" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Top left — enters top, exits left */}
          <path d="M0 350 C100 350 200 180 340 160 C480 140 560 240 700 220 C840 200 920 120 1060 100" 
          fill="none" stroke="url(#fadeTop)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          opacity="0.22"
          />
          <path d="M-4.23 263.48  C83.5 285.91 227.39 124.36 368.81 124.04  C510.23 123.72 575.53 233.88 716.95 233.56 C858.37 233.24 948.73 165.15 1090.15 164.83" 
          fill="none" 
          stroke="url(#fadeTopThin)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.1"
          />
          {/* Bottom right — enters right, exits bottom */}
          <path d="M1440 450 C1340 450 1240 620 1100 640 C960 660 880 560 740 580 C600 600 520 680 380 700" 
          fill="none" 
          stroke="url(#fadeBottom)" 
          strokeWidth="16" 
          strokeLinecap="round" 
          opacity="0.25"
          />
          <path d="M1445.88 525.93 C1346.85 512.01 1214.26 665.05 1072.84 665.37 C931.42 665.69 866.12 555.53 724.7 555.85 C583.27 556.18 492.92 624.26 351.5 624.58"
          fill="none" 
          stroke="url(#fadeBottomThin)" 
          strokeWidth="4" 
          strokeLinecap="round" 
          opacity="0.2"
          />
        </svg>
      
      {/* Header */}
      <div className="auth-col">
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon"><span>H</span></div>
          <span className="auth-logo-text">Helping Hands</span>
        </Link>
        <h2 className="auth-heading">
          Create your account
        </h2>
        <p className="auth-subheading">
          Get help from your community in minutes
        </p>

      {/* Form */}
      <div className="auth-card">
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="input-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Ram Piyari"
              />
            </div>

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
                placeholder="user@email.com"
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
                placeholder="At least 8 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="input-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Re-enter password"
              />
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="auth-divider mt-6">
            <div className="auth-divider-lin">
              <div className="w-full border-t border-gray-200" />
              </div>
              <div className="auth-divider-text">
                <span className="auth-divider-label">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Link
                to="/login"
                className="btn-outline w-full block text-center"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Volunteer Link */}
          <div className="auth-secondary-link">
            <p className="text-sm text-slate-500">
              Want to volunteer?{' '}
              <Link to="/volunteer/register" className="auth-link">
                Register as a volunteer
              </Link>
            </p>
        </div>
      </div>
    </div>
  )
}