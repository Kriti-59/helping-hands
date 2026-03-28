import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { matchAPI } from '../../services/api';

export default function HelperDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('notified');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const response = user.user_type === 'volunteer'
        ? await matchAPI.getVolunteerMatches(user.user_id, filter)
        : await matchAPI.getOrganizationMatches(user.user_id, filter);
      
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      await matchAPI.accept(matchId);
      fetchMatches(); // Refresh
    } catch (error) {
      console.error('Error accepting match:', error);
      alert(error.response?.data?.detail || 'Failed to accept match');
    }
  };

  const handleDecline = async (matchId) => {
    try {
      await matchAPI.decline(matchId);
      fetchMatches(); // Refresh
    } catch (error) {
      console.error('Error declining match:', error);
      alert(error.response?.data?.detail || 'Failed to decline match');
    }
  };

  const handleLogout = () => { logout(); navigate('/') }

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
            className={`db-sidebar-link ${filter === 'notified' ? 'db-sidebar-link--active' : ''}`}
            onClick={() => setFilter('notified')}
          >
            <div className="db-sidebar-dot" style={{ background: '#c8b8a0' }} />
            New Requests
          </button>
          <button
            className={`db-sidebar-link ${filter === 'accepted' ? 'db-sidebar-link--active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            <div className="db-sidebar-dot" style={{ background: '#a0b880' }} />
            Accepted
          </button>
          <button
            className={`db-sidebar-link ${filter === 'declined' ? 'db-sidebar-link--active' : ''}`}
            onClick={() => setFilter('declined')}
          >
            <div className="db-sidebar-dot" style={{ background: '#7a9aaa' }} />
            Declined
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

      {/* Main */}
      <main className="db-main">

        {/* Header */}
        <div className="db-header">
          <div>
            <h1 className="db-heading">
              Welcome back, {user.name?.split(' ')[0]}!
            </h1>
            <p className="db-subheading">{user.user_type === 'volunteer' ? 'Volunteer' : 'Organization'} Dashboard</p>
          </div>
        </div>

        {/* Matches List */}
        {loading ? (
          <p className="dashboard-loading">Loading requests...</p>
        ) : matches.length === 0 ? (
          <div className="dashboard-empty">
            <img 
              src="/assets/empty-state.png" 
              alt="No requests" 
              style={{ width: '220px', height: 'auto', marginBottom: '0.5rem' }}
            />
            <h3 className="dashboard-empty-title">
              {filter === 'notified' && 'No new requests'}
              {filter === 'accepted' && 'No accepted requests'}
              {filter === 'declined' && 'No declined requests'}
            </h3>
            <p className="dashboard-empty-body">
              {filter === 'notified' && 'No new requests at the moment.'}
              {filter === 'accepted' && 'You haven\'t accepted any requests yet.'}
              {filter === 'declined' && 'You haven\'t declined any requests yet.'}
            </p>
          </div>
        ) : (
          <div className="tl-feed">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={handleAccept}
                onDecline={handleDecline}
                userType={user.user_type}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function MatchCard({ match, onAccept, onDecline, userType }) {
  const request = match.request;
  const [showDetails, setShowDetails] = useState(false)

  const dotColor =
    match.status === 'accepted' ? '#4a6a7a' :
    match.status === 'declined' ? '#d8c8b0' : '#8a7a68'

  const dotFilled = match.status === 'accepted'

  const getUrgencyBadge = (urgency) => {
    const badges = {
      high: 'badge-high',
      medium: 'badge-medium',
      low: 'badge-low',
    };
    return badges[urgency] || 'badge-medium';
  };

  const formatCategory = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
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
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: request.urgency === 'high' ? '#b86050' :
                    request.urgency === 'medium' ? '#8a6a30' : '#4a6a7a'
            }}>
              {request.urgency} urgency
            </span>
            {"/"}
            <span className="tl-card-meta">
              {formatCategory(request.category)}
            </span>
            {"/"}
            {userType === 'volunteer' && match.distance_miles && (
              <>{" / "} <span className="tl-card-meta">
                📍 {match.distance_miles} miles away
              </span> </>
            )}
          </div>
          <span className="tl-card-meta">
            {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          </div>
          
          <p className="tl-card-desc">{request.description}</p>

          {/* Toggle details */}
          {(request.estimated_duration || request.requires_heavy_lifting || request.accessibility_requirements || request.flexibility_level === 'strict') && (
            <button
              onClick={() => setShowDetails(d => !d)}
              className="tl-card-hint"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              {showDetails ? '↑ Hide details' : '↓ Show details'}
            </button>
          )}

          {showDetails && (

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: '#6a6258' }}>
            
              {request.address && (
                <p>Location: {request.address}</p>
              )}
              {request.estimated_duration && (
                <p>Duration: About {request.estimated_duration} hour{request.estimated_duration > 1 ? 's' : ''}</p>
              )}
              {request.requires_heavy_lifting && (
                <p>Heavy lifting required</p>
              )}
              {request.accessibility_requirements && (
                <p>Accessibility: {request.accessibility_requirements}</p>
              )}
              {request.flexibility_level === 'strict' && (
                <p>Specific time required</p>
              )}
            </div>
          )}

          {/* Contact Info (only show if accepted) */}
          {match.status === 'accepted' && (
            <>
              <div className="tl-helper-box">
                <div className="tl-helper-avatar">
                  {request.requester_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="tl-helper-name"> {request.requester_name}
                  </p>
                  <p className="tl-helper-contact"> {request.requester_email}
                  {request.requester_phone ? ` · ${request.requester_phone}` : ''}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Contact info locked message — before accepting */}
          {match.status === 'notified' && (
            <div style={{
              fontSize: '0.75rem',
              color: '#6a5540',
              background: '#f0ece4',
              border: '1px solid #b7b2ad',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              marginTop: '0.25rem'
            }}>
              Contact details will be shared once you accept
            </div>
          )}

          {/* Action Buttons */}
          {match.status === 'notified' && (
            <div className="tl-card-actions">
              <button
                onClick={() => onAccept(match.id)}
                className="tl-action-btn tl-action-btn--green"
              >
                Accept
              </button>
              <button
                onClick={() => onDecline(match.id)}
                className="tl-action-btn tl-action-btn--red"
              >
                Decline
              </button>
            </div>
          )}

          {match.status === 'accepted' && (
            <p style={{ fontSize: '0.8rem', color: '#3a6020', fontWeight: 600, marginTop: '0.25rem' }}>
              ✓ You accepted this request
            </p>
          )}

          {match.status === 'declined' && (
            <p style={{ fontSize: '0.8rem', color: '#8a7a68', marginTop: '0.25rem' }}>
              {request.status === 'in_progress'
              ? 'This request was accepted by another volunteer'
              : 'You declined this request'}
            </p>
          )}
      </div>
    </div>
  );
  }