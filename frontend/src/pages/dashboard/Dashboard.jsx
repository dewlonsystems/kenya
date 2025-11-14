import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Chip,
  CircularProgress
} from '@mui/material'
import { 
  AccountBalanceWallet, 
  Work, 
  People, 
  Message, 
  Notifications, 
  TrendingUp,
  AttachMoney,
  LocalAtm
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { getOverview } from '../../services/api'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

function Dashboard() {
  const { currentUser, userData } = useAuth()
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        if (userData) {
          const response = await getOverview(userData.user_id)
          setOverview(response)
        }
      } catch (error) {
        console.error('Error fetching overview:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [userData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
          </Box>
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
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Dashboard
            </Typography>

            {/* Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', backgroundColor: '#f0f7f4' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <AccountBalanceWallet />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Total Wallet
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      KSh {overview?.wallet_balance?.toFixed(2) || '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <TrendingUp />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Completed Jobs
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {overview?.total_completed_jobs || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', backgroundColor: '#e3f2fd' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <Work />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Pending Jobs
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {overview?.pending_jobs || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', backgroundColor: '#f3e5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <People />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Referral Earnings
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      KSh {overview?.referral_earnings?.toFixed(2) || '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Wallet Breakdown */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Wallet Breakdown" 
                    avatar={<AttachMoney sx={{ color: 'primary.main' }} />}
                    sx={{ backgroundColor: 'primary.light', color: 'white' }}
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h6" color="textSecondary">Earnings Wallet</Typography>
                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          KSh {overview?.earnings_wallet?.toFixed(2) || '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" color="textSecondary">Referral Wallet</Typography>
                        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          KSh {overview?.referral_wallet?.toFixed(2) || '0.00'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Account Status" 
                    avatar={<LocalAtm sx={{ color: 'secondary.main' }} />}
                    sx={{ backgroundColor: 'secondary.light', color: 'white' }}
                  />
                  <CardContent>
                    <Chip 
                      label={overview?.is_activated ? 'Activated' : 'Not Activated'} 
                      color={overview?.is_activated ? 'success' : 'warning'} 
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Rating: {overview?.rating?.toFixed(1) || '0.0'} stars ({overview?.total_reviews || 0} reviews)
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Joined: {overview?.date_joined ? new Date(overview.date_joined).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Recent Activity" 
                    avatar={<Notifications sx={{ color: 'primary.main' }} />}
                  />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">
                      {overview?.unread_messages > 0 
                        ? `You have ${overview.unread_messages} unread messages` 
                        : 'No unread messages'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {overview?.pending_applications > 0 
                        ? `You have ${overview.pending_applications} pending job applications` 
                        : 'No pending applications'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {overview?.assigned_jobs > 0 
                        ? `You have ${overview.assigned_jobs} assigned jobs in progress` 
                        : 'No assigned jobs in progress'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Quick Actions" 
                    avatar={<Message sx={{ color: 'secondary.main' }} />}
                  />
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Need to activate your account? Contact support or check your activation status.
                    </Typography>
                    <Typography variant="body1">
                      Want to start earning? Browse available jobs or complete your profile further.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Dashboard
