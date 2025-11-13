import React, { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  TextField, 
  Button, 
  Grid, 
  Typography,
  Box,
  Alert
} from '@mui/material'
import { Person, Email, Phone, LocationOn, Edit } from '@mui/icons-material'
import { updateProfile } from '../services/api'

function ProfileEditForm({ userData, setUserData, onEditComplete }) {
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || '',
    phone_number: userData?.phone_number || '',
    street_address: userData?.street_address || '',
    house_number: userData?.house_number || '',
    zip_code: userData?.zip_code || '',
    town: userData?.town || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateProfile({
        user_id: userData.user_id,
        ...formData
      })
      
      // Update the parent component's user data
      setUserData({
        ...userData,
        ...formData
      })
      
      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        onEditComplete()
      }, 1500)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader 
        title="Edit Profile" 
        avatar={<Edit sx={{ color: 'primary.main' }} />}
        sx={{ backgroundColor: 'primary.light', color: 'white' }}
      />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                value={userData?.email || ''}
                disabled
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="House Number"
                name="house_number"
                value={formData.house_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Town/City"
                name="town"
                value={formData.town}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading ? null : <Edit />}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={onEditComplete}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProfileEditForm