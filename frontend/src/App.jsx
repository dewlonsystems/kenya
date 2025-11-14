import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import CompleteProfile from './pages/auth/CompleteProfile'
import Activation from './pages/activation/Activation'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Jobs from './pages/jobs/Jobs'
import Wallet from './pages/wallet/Wallet'
import Messages from './pages/messages/Messages'
import Profile from './pages/profile/Profile'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { userData, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9f7'
      }}>
        <div>Loading...</div>
      </div>
    )
  }
  
  if (!userData) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Public Route Component (for routes that don't need authentication)
function PublicRoute({ children }) {
  const { userData, loading } = useAuth()
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f9f7'
      }}>
        <div>Loading...</div>
      </div>
    )
  }
  
  // If user is already logged in, redirect to dashboard
  if (userData) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// Main App Routes Component
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/complete-profile" element={
        <PublicRoute>
          <CompleteProfile />
        </PublicRoute>
      } />
      <Route path="/activation" element={
        <PublicRoute>
          <Activation />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<Profile />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

// Main App Component
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