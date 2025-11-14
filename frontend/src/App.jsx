import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppRoutes from './AppRoutes'
import LoginPage from './pages/LoginPage'
import CompleteProfile from './pages/CompleteProfile'
import Activation from './pages/Activation'
import LandingPage from './pages/LandingPage'

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
  
  // If user is already logged in, redirect to dashboard
  if (userData) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

function AppRoutes() {
  const location = useLocation()
  
  // Define public routes that don't require auth
  const isPublicRoute = ['/login', '/complete-profile', '/activation'].includes(location.pathname)
  
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
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <AppRoutes />
        </ProtectedRoute>
      } />
      
      {/* Catch-all for any unmatched routes - redirect to dashboard if authenticated */}
      <Route path="*" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App