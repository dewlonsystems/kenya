import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material'
import { Google, Phone, Email } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { auth } from '../../utils/firebase'
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPhoneNumber } from 'firebase/auth'
import { verifyFirebaseAuth } from '../../services/api'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const { setUserData } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (firebaseUser) {
      handleFirebaseUser(firebaseUser)
    }
  }, [firebaseUser])

  const handleFirebaseUser = async (user) => {
    try {
      setLoading(true)
      setError('')
      const idToken = await user.getIdToken()
      const response = await verifyFirebaseAuth(idToken)
      
      if (response.user_exists) {
        // User exists, redirect to dashboard
        navigate('/dashboard')
      } else {
        // User doesn't exist, redirect to complete profile
        navigate('/complete-profile', { 
          state: { 
            firebase_uid: response.firebase_uid,
            email: response.email,
            phone_number: response.phone_number,
            auth_method: response.auth_method
          } 
        })
      }
    } catch (error) {
      setError('Failed to verify user with backend')
      setLoading(false)
      console.error(error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      setFirebaseUser(result.user)
    } catch (error) {
      setError('Failed to sign in with Google')
      setLoading(false)
      console.error(error)
    }
  }

  const handleEmailLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const email = prompt('Enter email:')
      const password = prompt('Enter password:')
      
      if (email && password) {
        const result = await signInWithEmailAndPassword(auth, email, password)
        setFirebaseUser(result.user)
      }
    } catch (error) {
      setError('Failed to sign in with email')
      setLoading(false)
      console.error(error)
    }
  }

  const handlePhoneLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const phoneNumber = prompt('Enter phone number (with country code):')
      
      if (phoneNumber) {
        const result = await signInWithPhoneNumber(auth, phoneNumber)
        setFirebaseUser(result.user)
      }
    } catch (error) {
      setError('Failed to sign in with phone')
      setLoading(false)
      console.error(error)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, color: 'primary.main' }}>
            Welcome to Freelance Kenya
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ width: '100%', mt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ 
                mb: 2, 
                backgroundColor: '#DB4437',
                '&:hover': { backgroundColor: '#c23321' }
              }}
            >
              Sign in with Google
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Email />}
              onClick={handleEmailLogin}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Sign in with Email
            </Button>
            
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Phone />}
              onClick={handlePhoneLogin}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Sign in with Phone
            </Button>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Login