import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import UserDashboard from './pages/user/UserDashboard';
import HelperDashboard from './pages/helper/HelperDashboard';

// Protected Route Component
function ProtectedRoute({ children, allowedTypes }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedTypes && !allowedTypes.includes(user.user_type)) {
    // Redirect to appropriate dashboard
    if (user.user_type === 'user') return <Navigate to="/dashboard" replace />;
    if (user.user_type === 'volunteer' || user.user_type === 'organization') {
      return <Navigate to="/helper/dashboard" replace />;
    }
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to={
          user.user_type === 'user' ? '/dashboard' : '/helper/dashboard'
        } /> : <UserLogin />} 
      />
      <Route path="/register" element={<UserRegister />} />

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedTypes={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Helper (Volunteer/Organization) Routes */}
      <Route
        path="/helper/dashboard"
        element={
          <ProtectedRoute allowedTypes={['volunteer', 'organization']}>
            <HelperDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App