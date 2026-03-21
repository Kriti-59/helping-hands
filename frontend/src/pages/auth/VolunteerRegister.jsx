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
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = currentStep > stepNum
        const isCurrent = currentStep === stepNum
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                ${isCompleted ? 'bg-primary-600 text-white' : ''}
                ${isCurrent ? 'bg-primary-600 text-white' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-200 text-slate-500' : ''}
              `}>
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={`text-xs hidden sm:block ${isCurrent ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-px ${currentStep > stepNum ? 'bg-primary-600' : 'bg-gray-200'}`} />
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">Helping Hands</span>
        </Link>
        <h2 className="text-center text-3xl font-bold text-slate-900">Become a volunteer</h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Help your community — one request at a time
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-lg sm:px-10 border border-gray-100">

          <StepIndicator currentStep={step} />

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1 — Account */}
          {step === 1 && (
            <div className="space-y-5">
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
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                Your address is used to match you with nearby requests. It's never shown publicly.
              </div>
              <div>
                <label className="input-label">Your Address *</label>
                <input name="address" type="text" value={formData.address}
                  onChange={handleChange} className="input-field"
                  placeholder="123 Main St, Kansas City, MO" />
              </div>
              <div>
                <label className="input-label">
                  How far are you willing to travel? — <span className="text-primary-600 font-medium">{formData.radius_miles} miles</span>
                </label>
                <input name="radius_miles" type="range" min="1" max="50" step="1"
                  value={formData.radius_miles} onChange={handleChange}
                  className="w-full mt-2" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 mile</span>
                  <span>50 miles</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Skills */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="input-label">What can you help with? * (select all that apply)</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors
                        ${formData.categories.includes(cat.value)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-slate-600 hover:border-gray-300'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Describe your experience *</label>
                <textarea name="skills_experience" value={formData.skills_experience}
                  onChange={handleChange} className="input-field resize-none" rows="3"
                  placeholder="e.g. I've been walking dogs for 5 years and am comfortable with large breeds. I also have a truck and have helped several families move." />
                <p className="text-xs text-slate-500 mt-1">
                  The more detail you provide, the better we can match you with relevant requests.
                </p>
              </div>

              <div>
                <label className="input-label">Languages spoken</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMON_LANGUAGES.map(lang => (
                    <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors
                        ${formData.languages.includes(lang)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-slate-600 hover:border-gray-300'
                        }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="input-label">Additional capabilities</label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="has_vehicle" checked={formData.has_vehicle}
                    onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-slate-700">Own a car or truck available</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="can_lift_heavy" checked={formData.can_lift_heavy}
                    onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                  <span className="text-sm text-slate-700">Can help with heavy lifting</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 4 — Profile */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="input-label">Bio (Optional)</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange}
                  className="input-field resize-none" rows="4"
                  placeholder="Tell the community a little about yourself and why you love volunteering..." />
                <p className="text-xs text-slate-500 mt-1">
                  This info is revealed to users after you accept their request.
                </p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-700">
                <p className="font-medium mb-1">You're almost done!</p>
                <p>Once you register, you'll start getting help requests in your area that match your skills.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button type="button" onClick={handleBack} className="btn-ghost flex-1">
                Back
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="btn-primary flex-1">
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating account...' : 'Complete Registration'}
              </button>
            )}
          </div>

          {/* Footer links */}
          {step === 1 && (
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Already have an account?</span>
                </div>
              </div>
              <Link to="/login" className="w-full btn-outline block text-center">Sign In</Link>
              <p className="text-center text-sm text-slate-500">
                Need help instead?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
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