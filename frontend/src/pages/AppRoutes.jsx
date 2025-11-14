import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Wallet from './pages/Wallet'
import Messages from './pages/Messages'
import Profile from './pages/Profile'

function AppRoutes() {
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

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  )
}

export default AppRoutes