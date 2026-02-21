import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Landing from './pages/LandingPage'
import UserLogin from './pages/auth/UserLogin'
import UserRegister from './pages/auth/UserRegister'
import VolunteerLogin from './pages/auth/VolunteerLogin'
import VolunteerRegister from './pages/auth/VolunteerRegister'
import UserDashboard from './pages/user/UserDashboard'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'

// Protected route component
function ProtectedRoute({ children, allowedTypes }) {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  if (allowedTypes && !allowedTypes.includes(user?.user_type)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/volunteer/login" element={<VolunteerLogin />} />
      <Route path="/volunteer/register" element={<VolunteerRegister />} />

      {/* Protected user routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedTypes={['user']}>
          <UserDashboard />
        </ProtectedRoute>
      } />

      {/* Protected volunteer routes */}
      <Route path="/volunteer/dashboard" element={
        <ProtectedRoute allowedTypes={['volunteer', 'organization']}>
          <VolunteerDashboard />
        </ProtectedRoute>
      } />

      {/* Catch all */}
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