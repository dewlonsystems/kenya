import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/Login'
import CompleteProfile from './pages/auth/CompleteProfile'
import Activation from './pages/activation/Activation'
import Dashboard from './pages/dashboard/Dashboard'
import Jobs from './pages/jobs/Jobs'
import Wallet from './pages/wallet/Wallet'
import Messages from './pages/messages/Messages'
import Profile from './pages/profile/Profile'
import NotFound from './pages/NotFound'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

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
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component
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
          <LoginPage />
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
      
      {/* Protected Routes with Layout */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ 
              flexGrow: 1, 
              padding: '24px',
              paddingTop: '80px', // Account for header height
              backgroundColor: '#f8f9f7'
            }}>
              <Header />
              <div style={{ marginTop: '24px' }}>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="jobs" element={<Jobs />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="profile" element={<Profile />} />
                </Routes>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
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