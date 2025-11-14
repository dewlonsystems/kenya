import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './auth/Login'
import CompleteProfile from './auth/CompleteProfile'
import Dashboard from './dashboard/Dashboard'
import Jobs from './jobs/Jobs'
import Wallet from './wallet/Wallet'
import Messages from './messages/Messages'
import Profile from './profile/Profile'
import NotFound from './NotFound'
import Activation from './activation/Activation'
import LandingPage from './LandingPage'
import { useAuth } from '../contexts/AuthContext'

// Public Route Component (no auth context)
function PublicRoute({ children }) {
  return children
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { userData, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div> // You can replace this with your loading component
  }
  
  if (!userData) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - No AuthContext */}
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
      
      {/* Protected Routes - With AuthContext */}
      <Route path="/complete-profile" element={
        <ProtectedRoute>
          <CompleteProfile />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <Wallet />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <Messages />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/activation" element={
        <ProtectedRoute>
          <Activation />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

// Wrapper component that includes AuthProvider only for protected routes
function AppRoutesWithAuth() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default AppRoutesWithAuth