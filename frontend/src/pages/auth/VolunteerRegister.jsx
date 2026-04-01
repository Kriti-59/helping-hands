import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = [
  { value: 'groceries', label: 'Groceries & Shopping' },
  { value: 'dog_walking', label: 'Dog Walking & Pet Care' },
  { value: 'transportation', label: 'Transportation & Rides' },
  { value: 'yard_work', label: 'Yard Work & Gardening' },
  { value: 'moving_help', label: 'Moving & Heavy Lifting' },
  { value: 'childcare', label: 'Childcare & Babysitting' },
  { value: 'tutoring', label: 'Tutoring & Education' },
  { value: 'elderly_care', label: 'Elderly Care & Companionship' },
  { value: 'home_repairs', label: 'Home Repairs & Handyman' },
  { value: 'meal_preparation', label: 'Meal Preparation & Cooking' },
  { value: 'cleaning', label: 'Cleaning & Organizing' },
  { value: 'technology_help', label: 'Technology Help' },
  { value: 'errands', label: 'General Errands' },
  { value: 'language_practice', label: 'Language Practice' },
  { value: 'companionship', label: 'Companionship & Social Visits' },
]

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'Mandarin', 'Arabic',
  'Hindi', 'Portuguese', 'Russian', 'Japanese', 'Korean',
  'German', 'Swahili', 'Somali', 'Gujarati', 'Telugu',
]

function StepIndicator({ currentStep }) {
  const steps = ['Account', 'Location', 'Skills', 'Profile']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = currentStep > stepNum
        const isCurrent = currentStep === stepNum
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 500,
                backgroundColor: isCompleted || isCurrent ? '#3a3228' : '#e0d8cc',
                color: isCompleted || isCurrent ? 'white' : '#6a6258',
              }}>
                {isCompleted ? '✓' : stepNum}
              </div>
              <span style={{
                fontSize: '0.75rem',
                color: isCurrent ? '#3a3228' : '#8a7a68',
                fontWeight: isCurrent ? 600 : 400,
              }}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{
                width: '2rem', height: '1px',
                backgroundColor: currentStep > stepNum ? '#3a3228' : '#d8c8b0'
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function VolunteerRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [formData, setFormData] = useState({
    // Step 1 — Account
    name: '',
    email: '',
    password: '',
    phone: '',
    // Step 2 — Location
    address: '',
    latitude: 39.0997,
    longitude: -94.5786,
    radius_miles: 10,
    // Step 3 — Skills
    categories: [],
    skills_experience: '',
    has_vehicle: false,
    can_lift_heavy: false,
    languages: [],
    // Step 4 — Profile
    bio: '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleCategory = (value) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter(c => c !== value)
        : [...prev.categories, value]
    }))
  }

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }))
  }

  const validateStep = () => {
    setError('')
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setError('Please fill in all required fields')
        return false
      }
      if (formData.password !== confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }
    }
    if (step === 2) {
      if (!formData.address) {
        setError('Please enter your address so we can match you with nearby requests')
        return false
      }
    }
    if (step === 3) {
      if (formData.categories.length === 0) {
        setError('Please select at least one category you can help with')
        return false
      }
      if (!formData.skills_experience.trim()) {
        setError('Please describe your experience — this helps us find the best matches for you')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(s => s - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return
    setLoading(true)

    try {
      await authAPI.registerVolunteer(formData)

      const loginResponse = await authAPI.login({
        email: formData.email,
        password: formData.password
      })

      const { token, user_id, user_type, name, email } = loginResponse.data
      login({ user_id, user_type, name, email }, token)
      navigate('/helper/dashboard')

    } catch (err) {
      console.error('Registration error:', err)
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <svg className="hero-corner-lines" viewBox="0 0 1440 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fadeTop" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3a3228" stopOpacity="0"/>
            <stop offset="15%" stopColor="#3a3228" stopOpacity="1"/>
            <stop offset="85%" stopColor="#3a3228" stopOpacity="1"/>
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
        <path d="M0 350 C100 350 200 180 340 160 C480 140 560 240 700 220 C840 200 920 120 1060 100"
          fill="none" stroke="url(#fadeTop)" strokeWidth="16" strokeLinecap="round" opacity="0.22"/>
        <path d="M-4.23 263.48 C83.5 285.91 227.39 124.36 368.81 124.04 C510.23 123.72 575.53 233.88 716.95 233.56 C858.37 233.24 948.73 165.15 1090.15 164.83"
          fill="none" stroke="url(#fadeTopThin)" strokeWidth="4" strokeLinecap="round" opacity="0.1"/>
        <path d="M1440 450 C1340 450 1240 620 1100 640 C960 660 880 560 740 580 C600 600 520 680 380 700"
          fill="none" stroke="url(#fadeBottom)" strokeWidth="16" strokeLinecap="round" opacity="0.25"/>
        <path d="M1445.88 525.93 C1346.85 512.01 1214.26 665.05 1072.84 665.37 C931.42 665.69 866.12 555.53 724.7 555.85 C583.27 556.18 492.92 624.26 351.5 624.58"
          fill="none" stroke="url(#fadeBottomThin)" strokeWidth="4" strokeLinecap="round" opacity="0.2"/>
      </svg>
      <div className="auth-col" style={{ maxWidth: '32rem' }}>
        <Link to="/" className="auth-logo">
          <div className="auth-logo-icon">
            <span>H</span>
          </div>
          <span className="auth-logo-text">Helping Hands</span>
        </Link>
        <h2 className="auth-heading">Become a volunteer</h2>
        <p className="auth-subheading">
          Help your community — one request at a time
        </p>

      <div className="auth-card">

          <StepIndicator currentStep={step} />

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Step 1 — Account */}  
          {step === 1 && (
            <div className="auth-form">
              <div>
                <label className="input-label">Full Name *</label>
                <input name="name" type="text" value={formData.name}
                  onChange={handleChange} className="input-field"/>
              </div>
              <div>
                <label className="input-label">Email Address *</label>
                <input name="email" type="email" value={formData.email}
                  onChange={handleChange} className="input-field"/>
              </div>
              <div>
                <label className="input-label">Phone *</label>
                <input name="phone" type="tel" value={formData.phone}
                  onChange={handleChange} className="input-field"
                  required />
              </div>
              <div>
                <label className="input-label">Password *</label>
                <input name="password" type="password" value={formData.password}
                  onChange={handleChange} className="input-field" placeholder="At least 6 characters" />
              </div>
              <div>
                <label className="input-label">Confirm Password *</label>
                <input name="confirmPassword" type="password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field" placeholder="Re-enter password" />
              </div>
            </div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <div className="auth-form">
              <div className="info-box">
                <p className="info-box-body">Your address is used to match you with nearby requests. It's never shown publicly.</p>
              </div>
              <div>
                <label className="input-label">Your Address *</label>
                <input name="address" type="text" value={formData.address}
                  onChange={handleChange} className="input-field"
                  placeholder="123 Main St, Kansas City, MO" />
              </div>
              <div>
                <label className="input-label">
                  How far are you willing to travel? — <span style={{ color: '#4a6a7a', fontWeight: 600 }}>{formData.radius_miles} miles</span>
                </label>
                <input name="radius_miles" type="range" min="1" max="50" step="1"
                  value={formData.radius_miles} onChange={handleChange}
                  className="w-full mt-2" />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="input-hint">1 mile</span>
                  <span className="input-hint">50 miles</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Skills */}
          {step === 3 && (
            <div className="auth-form">
              <div>
                <label className="input-label">What can you help with? * (select all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={formData.categories.includes(cat.value) ? 'btn-secondary' : 'btn-ghost'}
                      style={{ textAlign: 'left', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Describe your experience *</label>
                <textarea name="skills_experience" value={formData.skills_experience}
                  onChange={handleChange} className="input-field" style={{ resize: 'none' }} rows="3"
                  placeholder="e.g. I've been walking dogs for 5 years and am comfortable with large breeds. I also have a truck and have helped several families move." />
                <p className="input-hint">
                  The more detail you provide, the better we can match you with relevant requests.
                </p>
              </div>

              <div>
                <label className="input-label">Languages spoken</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {COMMON_LANGUAGES.map(lang => (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={formData.languages.includes(lang) ? 'btn-secondary' : 'btn-ghost'}
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className="input-label">Additional capabilities</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="has_vehicle" checked={formData.has_vehicle}
                    onChange={handleChange} style={{ width: '1rem', height: '1rem' }}/>
                  <span style={{ fontSize: '0.875rem', color: '#3a3228' }}>Own a car or truck available</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input type="checkbox" name="can_lift_heavy" checked={formData.can_lift_heavy}
                    onChange={handleChange} style={{ width: '1rem', height: '1rem' }}/>
                  <span style={{ fontSize: '0.875rem', color: '#3a3228' }}>Can help with heavy lifting</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4 — Profile */}
          {step === 4 && (
            <div className="auth-form">
              <div>
                <label className="input-label">Bio (Optional)</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange}
                  className="input-field" style={{ resize: 'none' }} rows="4"
                  placeholder="Tell the community a little about yourself and why you love volunteering..." />
                <p className="input-hint">
                  This info is revealed to users after you accept their request.
                </p>
              </div>

              <div className="info-box">
                <p className="info-box-title">You're almost done!</p>
                <p className="input-hint">Once you register, you'll start getting help requests in your area that match your skills.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn-ghost" style={{ flex: 1 }}>
                Back
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="btn-primary" style={{ flex: 1 }}>
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                {loading ? 'Creating account...' : 'Complete Registration'}
              </button>
            )}
          </div>

          {/* Footer links */}
          {step === 1 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="auth-divider">
                <div className="auth-divider-line">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="auth-divider-text">
                  <span className="auth-divider-label">Already have an account?</span>
                </div>
              </div>
              <div className="mt-4">
              <Link to="/login" className="w-full btn-outline block text-center">Sign In</Link>
              </div>
              <p className="auth-secondary-link">
                Need help instead?{' '}
                <Link to="/register" className="auth-link">
                  Register as a user
                </Link>
              </p>
            </div>
          )}

      </div>
    </div>
  </div>
  )
}