import React, { useState } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { completeProfile, verifyFirebaseAuth, getUserProfile } from '../../services/api'

function CompleteProfile() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setUserData } = useAuth() // Get the setUserData function
  const { firebase_uid, email, phone_number, auth_method } = location.state || {}
  
  const [formData, setFormData] = useState({
    firebase_uid: firebase_uid || '',
    email: email || '',
    full_name: '',
    phone_number: phone_number || '',
    street_address: '',
    house_number: '',
    zip_code: '',
    town: '',
    referral_code: ''
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState(auth_method || 'email')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.full_name) {
      setError('Full name is required')
      return
    }
    
    if (authMethod === 'phone' && !formData.email) {
      setError('Email is required for phone authentication')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const profileData = {
        ...formData,
        auth_method: authMethod
      }
      
      const response = await completeProfile(profileData)
      console.log('Profile completed:', response)
      
      // After successful profile completion, update the user data in AuthContext
      // First, verify the user exists in the database
      const token = await auth.currentUser.getIdToken()
      const verifyResponse = await verifyFirebaseAuth(token)
      
      if (verifyResponse.user_exists && verifyResponse.user_id) {
        // Get the user's profile data
        const profileResponse = await getUserProfile(verifyResponse.user_id)
        setUserData({
          ...profileResponse,
          user_id: verifyResponse.user_id
        })
      }
      
      // Redirect to activation page
      navigate('/activation')
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to complete profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!firebase_uid) {
    navigate('/')
    return null
  }

  return (
    <Container component="main" maxWidth="sm">
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
            Complete Your Profile
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="full_name"
              label="Full Name"
              name="full_name"
              autoComplete="name"
              autoFocus
              value={formData.full_name}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={authMethod !== 'phone'}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="phone_number"
              label="Phone Number"
              name="phone_number"
              autoComplete="tel"
              value={formData.phone_number}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="street_address"
              label="Street Address"
              name="street_address"
              autoComplete="street-address"
              value={formData.street_address}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="house_number"
              label="House Number"
              name="house_number"
              autoComplete="address-line2"
              value={formData.house_number}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="zip_code"
              label="ZIP Code"
              name="zip_code"
              autoComplete="postal-code"
              value={formData.zip_code}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="town"
              label="Town/City"
              name="town"
              autoComplete="address-level2"
              value={formData.town}
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="referral_code"
              label="Referral Code (Optional)"
              name="referral_code"
              value={formData.referral_code}
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, backgroundColor: 'primary.main' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Profile'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default CompleteProfile