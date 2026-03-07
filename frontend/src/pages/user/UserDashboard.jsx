import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI, requestAPI } from '../../services/api'

export default function UserDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const response = await userAPI.getRequests(user.user_id)
      setRequests(response.data)
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold text-slate-800">HelpHub</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Welcome, {user.name}!</span>
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-slate-500">
            Submit help requests and track their status
          </p>
        </div>

        {/* Request Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn-primary"
          >
            + Submit New Request
          </button>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <RequestFormModal
            onClose={() => setShowRequestForm(false)}
            onSuccess={() => {
              setShowRequestForm(false)
              loadRequests()
            }}
            userId={user.user_id}
          />
        )}

        {/* Requests List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            My Requests
          </h2>

          {loading ? (
            <div className="text-center py-8 text-slate-500">
              Loading...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No requests yet
              </h3>
              <p className="text-slate-500 mb-6">
                Submit your first help request to get started
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="btn-primary"
              >
                Submit Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Request Card Component
function RequestCard({ request }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      matched: 'badge-matched',
      in_progress: 'badge-matched',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
      no_matches: 'badge-no-matches',
    }
    return badges[status] || 'badge-pending'
  }

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    }
    return badges[urgency] || 'badge-medium'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={getStatusBadge(request.status)}>
              {request.status.replace('_', ' ')}
            </span>
            <span className={getUrgencyBadge(request.urgency)}>
              {request.urgency}
            </span>
            <span className="text-xs text-slate-400">
              {request.category.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-700 mb-2">{request.description}</p>
          {request.address && (
            <p className="text-sm text-slate-500">📍 {request.address}</p>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-400">
        Submitted {new Date(request.created_at).toLocaleDateString()}
      </div>
    </div>
  )
}

// Request Form Modal Component
function RequestFormModal({ onClose, onSuccess, userId }) {
  const [formData, setFormData] = useState({
    description: '',
    address: '',
    latitude: 39.0997,
    longitude: -94.5786,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.description.trim()) {
      setError('Please describe what you need help with')
      return
    }

    setLoading(true)

    try {
      await requestAPI.create(formData, userId)
      onSuccess()
    } catch (err) {
      console.error('Error creating request:', err)
      setError('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Submit Help Request
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Description */}
            <div>
              <label className="input-label">
                What do you need help with? *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field resize-none"
                rows="4"
                placeholder="Example: I need help walking my golden retriever this afternoon around 3pm. He's friendly and loves people!"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Our AI will automatically categorize your request and find the best helpers
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="input-label">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                placeholder="123 Main St, Kansas City, MO"
              />
              <p className="text-xs text-slate-500 mt-1">
                Helps us find volunteers nearby. We'll use Kansas City by default.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    What happens next?
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>We'll classify your request using AI</li>
                    <li>Find the best volunteers or organizations</li>
                    <li>Notify them about your request</li>
                    <li>You'll see updates on this dashboard</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}