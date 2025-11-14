import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/dashboard/Dashboard'
import Jobs from '../pages/jobs/Jobs'
import Wallet from '../pages/wallet/Wallet'
import Messages from '../pages/messages/Messages'
import Profile from '../pages/profile/Profile'
import CompleteProfile from '../pages/auth/CompleteProfile'
import Activation from '../pages/activation/Activation'
import { useAuth } from './AuthContext'

function ProtectedRoute({ children }) {
  const { userData, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!userData) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function AuthenticatedApp() {
  return (
    <Routes>
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
    </Routes>
  )
}

export default AuthenticatedApp