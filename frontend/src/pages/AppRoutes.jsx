import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './auth/Login'
import CompleteProfile from './auth/CompleteProfile'
import Dashboard from './dashboard/Dashboard'
import Jobs from './jobs/Jobs'
import Wallet from './wallet/Wallet'
import Messages from './messages/Messages'
import Profile from './profile/Profile'
import NotFound from './NotFound'
import { AuthProvider } from '../contexts/AuthContext'
import Activation from './activation/Activation'
import LandingPage from './LandingPage'

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/activation" element={<Activation />} />
        <Route path="/home" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default AppRoutes