import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import AuthenticatedApp from './contexts/AuthenticatedApp'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - No Auth Context */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - With Auth Context */}
        <Route path="/*" element={
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        } />
      </Routes>
    </Router>
  )
}

export default App