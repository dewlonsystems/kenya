import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import LandingPage from './LandingPage'
import LoginPage from './auth/Login'
import CompleteProfile from './auth/CompleteProfile'
import Activation from './activation/Activation'
import DashboardContent from './dashboard/Dashboard' // Updated import name
import Jobs from './jobs/Jobs'
import Wallet from './wallet/Wallet'
import Messages from './messages/Messages'
import Profile from './profile/Profile'
import NotFound from './NotFound'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

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
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ 
              flexGrow: 1, 
              padding: '24px',
              paddingTop: '80px',
              backgroundColor: '#f8f9f7'
            }}>
              <Header />
              <DashboardContent />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ 
              flexGrow: 1, 
              padding: '24px',
              paddingTop: '80px',
              backgroundColor: '#f8f9f7'
            }}>
              <Header />
              <Jobs />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ 
              flexGrow: 1, 
              padding: '24px',
              paddingTop: '80px',
              backgroundColor: '#f8f9f7'
            }}>
              <Header />
              <Wallet />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ 
              flexGrow: 1, 
              padding: '24px',
              paddingTop: '80px',
              backgroundColor: '#f8f9f7'
            }}>
              <Header />
              <Messages />
            </div>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <div style={{ 
              flexGrow: 1, 
              padding: '24px',
              paddingTop: '80px',
              backgroundColor: '#f8f9f7'
            }}>
              <Header />
              <Profile />
            </div>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes