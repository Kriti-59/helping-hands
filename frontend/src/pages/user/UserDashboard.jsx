import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI, requestAPI, matchAPI } from '../../services/api'

export default function UserDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [viewMode, setViewMode] = useState('active') // 'active' or 'history'

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

  // Filter requests based on view mode
  const filteredRequests = requests.filter(req => {
    if (viewMode === 'active') {
      return ['pending', 'matched', 'no_matches', 'in_progress'].includes(req.status)
    } else {
      return ['completed', 'cancelled'].includes(req.status)
    }
  })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="db-layout">
      
      {/* Sidebar */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">
          <div className="db-sidebar-logo-icon">HH</div>
          <span className="db-sidebar-logo-text">Helping Hands</span>
        </div>

        <nav className="db-sidebar-nav">
          <button 
            className={`db-sidebar-link ${viewMode === 'active' ? 'db-sidebar-link--active' : ''}`}
            onClick={() => setViewMode('active')}
          >
            <div className="db-sidebar-dot" style={{ background: '#c8b8a0' }} />
            My Requests
          </button>
          <button className="db-sidebar-link" onClick={() => setShowRequestForm(true)}>
            <div className="db-sidebar-dot" style={{ background: '#a0b880' }} />
            New Request
          </button>
          <button 
            className={`db-sidebar-link ${viewMode === 'history' ? 'db-sidebar-link--active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            <div className="db-sidebar-dot" style={{ background: '#7a9aaa' }} />
            History
          </button>
        </nav>

        <div className="db-sidebar-bottom">
          <div className="db-sidebar-user">
            <div className="db-sidebar-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <span className="db-sidebar-username">{user.name}</span>
          </div>
          <button className="db-sidebar-link" onClick={handleLogout}>
            <div className="db-sidebar-dot" style={{ background: '#a87868' }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="db-main">
        
        {/* Header */}
        <div className="db-header">
          <div>
            <h1 className = "db-heading">
              {viewMode === 'active' 
                ? `Welcome back, ${user.name?.split(' ')[0]}`
                : 'Request History'
              }
            </h1>
            <p className="db-subheading">
              {viewMode === 'active'
                ? "Here's what's going on with your requests"
                : "Your completed and cancelled requests"
              }
            </p>
          </div>

        {/* Request Button */}
          {viewMode === 'active' && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="btn-primary"
            >
              + New Request
            </button>
          )}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <p className="dashboard-loading">Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <div className="dashboard-empty">
            <h3 className="dashboard-empty-title">
              {viewMode === 'active' ? 'No active requests' : 'No history yet'}
            </h3>
            <p className="dashboard-empty-body">
              {viewMode === 'active' 
                ? 'Submit your first help request to get started'
                : 'Your completed and cancelled requests will appear here'
              }
            </p>
            {viewMode === 'active' && (
              <button onClick={() => setShowRequestForm(true)} className="btn-primary">
                Submit Request
              </button>
            )}
          </div>
        ) : (
          <div className="db-cards-grid">
            {filteredRequests.map((request, i) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                index={i}
                onUpdate={loadRequests}
                userId={user.user_id}
              />
            ))}
          </div>
        )}

      </main>

      {showRequestForm && (
        <RequestFormModal
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => { setShowRequestForm(false); loadRequests() }}
          userId={user.user_id}
        />
      )}
    </div>
  );
}

// Request Card Component with Actions
function RequestCard({ request, index, onUpdate, userId }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const accentColors = ['#3a3228', '#4a6a7a', '#6a6258', '#8a7a68', '#3a5a6a']
  const accent = accentColors[index % accentColors.length]
  
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

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      matched: 'Matched',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_matches: 'No Matches',
    }
    return texts[status] || status
  }

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    }
    return badges[urgency] || 'badge-medium'
  }

  const formatCategory = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const acceptedHelper = request.accepted_by_volunteer_id 
    ? { type: 'volunteer', id: request.accepted_by_volunteer_id }
    : request.accepted_by_organization_id
    ? { type: 'organization', id: request.accepted_by_organization_id }
    : null

  // Mark as Complete
  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this request as completed?')) return
    
    setActionLoading(true)
    try {
      await requestAPI.updateStatus(request.id, 'completed')
      onUpdate()
    } catch (error) {
      console.error('Error marking complete:', error)
      alert('Failed to mark request as completed')
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel Request
  const handleCancel = async () => {
    setShowCancelModal(false)
    setActionLoading(true)
    try {
      await requestAPI.updateStatus(request.id, 'cancelled')
      onUpdate()
    } catch (error) {
      console.error('Error cancelling request:', error)
      alert('Failed to cancel request')
    } finally {
      setActionLoading(false)
    }
  }

  // Determine available actions based on status
  const canEdit = ['pending', 'matched', 'no_matches'].includes(request.status)
  const canCancel = !['completed', 'cancelled'].includes(request.status)
  const canComplete = request.status === 'in_progress'

  const dotColor =
  request.status === 'in_progress' ? '#4a6a7a' :  // teal — filled
  request.status === 'matched'     ? '#4a6a7a' :  // teal — filled
  request.status === 'completed'   ? '#6a6258' :  // muted brown — filled
  request.status === 'cancelled'   ? '#d8c8b0' :  // light — empty
  request.status === 'no_matches'  ? '#d8c8b0' :  // light — empty
                                     '#8a7a68'    // pending — half

const dotFilled =
  ['in_progress', 'matched', 'completed'].includes(request.status)

  return (
    <>
      <div className="tl-row">
        <div className="tl-rail">
          <div className="tl-dot" style={{ borderColor: dotColor }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dotFilled ? dotColor : 'transparent'
            }} />
          </div>
        </div>
        <div className="tl-card">
          <div className="tl-card-top">
            <span className={getStatusBadge(request.status)}>
              {getStatusText(request.status)}
            </span>
            <span className="tl-card-meta">
              {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}
              {formatCategory(request.category)}
            </span>
          </div>

          <p className="tl-card-desc">{request.description}</p>

          {request.address && (
            <p className="request-location">📌 {request.address}</p>
          )}

          {/* Show helper info if accepted */}
          {request.status === "in_progress" && acceptedHelper && (
            <AcceptedHelperInfo
              requestId={request.id}
              helperType={acceptedHelper.type}
            />
          )}

        <div className="tl-card-actions">
          {canComplete && (
            <button onClick={handleMarkComplete} disabled={actionLoading} className="tl-action-btn tl-action-btn--green">
              ✓ Complete
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              disabled={actionLoading}
              className="tl-action-btn tl-action-btn--blue"
            >
              Edit
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={actionLoading}
              className="tl-action-btn tl-action-btn--red"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditRequestModal
          request={request}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
          }}
          userId={userId}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <ConfirmCancelModal
          onConfirm={handleCancel}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </>
  );
}

// Accepted Helper Info Component
function AcceptedHelperInfo({ requestId, helperType }) {
  const [helperInfo, setHelperInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHelperInfo();
  }, [requestId]);

  const fetchHelperInfo = async () => {
    try {
      const response = await matchAPI.getAcceptedHelperInfo(requestId);
      setHelperInfo(response.data);
    } catch (error) {
      console.error('Error fetching helper info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="info-box" style={{ marginTop: '0.75rem' }}>
        <p className="info-box-body">Loading helper information...</p>
      </div>
    );
  }

  if (!helperInfo) {
    return null;
  }

  return (
    <div className="tl-helper-box">
      <div className="tl-helper-avatar">
        {helperInfo.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="tl-helper-name">
          {helperInfo.name} — {helperType === 'volunteer' ? 'Volunteer' : 'Organization'}
        </p>
        <p className="tl-helper-contact">
          {helperInfo.email}{helperInfo.phone ? ` · ${helperInfo.phone}` : ''}
        </p>
      </div>
    </div>
  );
}

// Cancel Confirmation Modal
function ConfirmCancelModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '28rem' }}>
        <div className="modal-inner">
          <h3 className="modal-title">
            Cancel Request?
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6a6258', margin: '0.75rem 0 1.5rem' }}>
          Are you sure you want to cancel this request? This action cannot be undone. If a volunteer has already accepted, they will be notified.
          </p>
          <div className="modal-actions">
            <button
              onClick={onCancel}
              className="btn-ghost flex-1"
            >
              Keep Request
            </button>
            <button
              onClick={onConfirm}
              className="btn-danger"
            >
              Yes, Cancel Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Request Modal
function EditRequestModal({ request, onClose, onSuccess, userId }) {
  const [formData, setFormData] = useState({
    description: request.description,
    address: request.address || '',
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
      await requestAPI.update(request.id, formData, userId)
      onSuccess()
    } catch (err) {
      console.error('Error updating request:', err)
      
      // Handle specific error responses
      if (err.response?.status === 403) {
        setError('You do not have permission to edit this request.')
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.detail || 'Cannot edit this request. It may have already been matched or completed.')
      } else {
        setError('Failed to update request. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-inner">

          <div className="modal-header">
            <h2 className="modal-title">Edit Request</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* Info */}
          <div className="info-box" style={{ marginBottom: '1.5rem' }}>
            <p className="info-box-body">
              <strong>Note:</strong> Editing your request will re-run AI matching to find the best helpers for your updated needs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Description */}
            <div>
              <label className="input-label">What do you need help with? *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="4"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="input-label">Location</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                placeholder="123 Main St, Kansas City, MO"
              />
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
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
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-inner">

          <div className="modal-header">
            <h2 className="modal-title">Submit Help Request</h2>
            <button onClick={onClose} className="modal-close">×</button>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">

            {/* Description */}
            <div>
              <label className="input-label">What do you need help with? *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Example: I need help walking my golden retriever. He's friendly and loves people!"
                required
              />
              <p className="input-hint">
                Our AI will automatically categorize your request and find the best helpers
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="input-label">Location (Optional)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                placeholder="123 Main St, Kansas City, MO"
              />
              <p className="input-hint">
                Helps us find volunteers nearby. We'll use Kansas City by default.
              </p>
            </div>

            {/* Info box */}
            <div className="info-box">
                  <p className="info-box-title">What happens next?</p>
                  <ol className="info-box-body">
                    <li>We'll classify your request using AI</li>
                    <li>Find the best volunteers or organizations</li>
                    <li>Notify them about your request</li>
                    <li>You'll see updates on this dashboard</li>
                  </ol>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
