import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Rating, 
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  AppBar,
  Alert
} from '@mui/material'
import { Person, Email, Phone, LocationOn, Star, Work, TrendingUp, Edit } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { getUserProfile } from '../../services/api'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import GeometricLoader from '../../components/GeometricLoader'
import ProfileEditForm from '../../components/ProfileEditForm'
import SkillsManager from '../../components/SkillsManager'
import PortfolioManager from '../../components/PortfolioManager'

function Profile() {
  const { userData: authUserData, setUserData, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (authUserData && authUserData.user_id) {
          const response = await getUserProfile(authUserData.user_id)
          setProfile(response)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (authUserData && authUserData.user_id) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [authUserData])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleEditComplete = () => {
    setIsEditing(false)
    // Refresh profile data after editing
    const fetchProfile = async () => {
      try {
        if (authUserData && authUserData.user_id) {
          const response = await getUserProfile(authUserData.user_id)
          setProfile(response)
          setUserData(response) // Update the auth context as well
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }

  const handleSkillsUpdate = () => {
    // Refresh profile data after adding skills
    const fetchProfile = async () => {
      try {
        if (authUserData && authUserData.user_id) {
          const response = await getUserProfile(authUserData.user_id)
          setProfile(response)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }

  const handlePortfolioUpdate = () => {
    // Refresh profile data after adding portfolio
    const fetchProfile = async () => {
      try {
        if (authUserData && authUserData.user_id) {
          const response = await getUserProfile(authUserData.user_id)
          setProfile(response)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <GeometricLoader />
          </Box>
        </Box>
      </Box>
    )
  }

  if (!authUserData || !authUserData.user_id) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <Alert severity="warning" sx={{ width: '100%' }}>
                User data not available. Please log in again.
              </Alert>
            </Box>
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Profile
            </Typography>

            {/* Profile Header */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: 40, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {profile?.full_name || 'No Name'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile?.email}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Rating 
                        value={profile?.rating || 0} 
                        readOnly 
                        precision={0.5} 
                        size="large"
                      />
                      <Typography variant="body2" color="textSecondary">
                        {profile?.total_reviews || 0} reviews
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Email sx={{ mr: 2, color: 'primary.main' }} />
                          <Typography variant="body1">
                            <strong>Email:</strong> {profile?.email}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Phone sx={{ mr: 2, color: 'primary.main' }} />
                          <Typography variant="body1">
                            <strong>Phone:</strong> {profile?.phone_number || 'Not provided'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
                          <Typography variant="body1">
                            <strong>Address:</strong> {profile?.street_address || 'Not provided'}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                          <Typography variant="body1">
                            <strong>Total Earnings:</strong> KSh {profile?.total_earnings?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Star sx={{ mr: 2, color: 'secondary.main' }} />
                          <Typography variant="body1">
                            <strong>Account Status:</strong> 
                            <Chip 
                              label={profile?.is_activated ? 'Activated' : 'Not Activated'} 
                              color={profile?.is_activated ? 'success' : 'warning'} 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3 }}>
                      <Button 
                        variant="contained" 
                        onClick={handleEdit}
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Edit Form (only shown when editing) */}
            {isEditing && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <ProfileEditForm 
                    userData={profile} 
                    setUserData={setProfile}
                    onEditComplete={handleEditComplete}
                  />
                </Grid>
              </Grid>
            )}

            {/* Tabs for Skills and Portfolio */}
            {!isEditing && (
              <>
                <AppBar position="static" color="default" sx={{ mb: 3, backgroundColor: 'white', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    indicatorColor="primary" 
                    textColor="primary" 
                    variant="fullWidth"
                  >
                    <Tab label="Skills" />
                    <Tab label="Portfolio" />
                  </Tabs>
                </AppBar>

                {/* Tab Content */}
                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <SkillsManager 
                        userData={profile} 
                        onSkillsUpdate={handleSkillsUpdate}
                      />
                    </Grid>
                  </Grid>
                )}
                
                {activeTab === 1 && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <PortfolioManager 
                        userData={profile} 
                        onPortfolioUpdate={handlePortfolioUpdate}
                      />
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Profile