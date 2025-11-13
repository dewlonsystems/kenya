import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Grid, 
  Alert,
  CircularProgress,
  Divider,
  Chip,
  TextField
} from '@mui/material'
import { AttachMoney, Payment, SkipNext, Verified } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { initiateActivation, getOverview } from '../../services/api'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import GeometricLoader from '../../components/GeometricLoader'
import { useNavigate } from 'react-router-dom'

function Activation() {
  const { userData, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [paymentData, setPaymentData] = useState({
    phone_number: '',
    amount: 1000  // Default activation fee
  })
  const [checkoutRequestId, setCheckoutRequestId] = useState(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    const checkActivationStatus = async () => {
      try {
        if (userData && userData.user_id) {
          const response = await getOverview(userData.user_id)
          if (response.is_activated) {
            // User is already activated, redirect to dashboard
            navigate('/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Error checking activation status:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userData) {
      checkActivationStatus()
    } else {
      setLoading(false)
    }
  }, [userData, navigate])

  const handlePayment = async () => {
    if (!paymentData.phone_number) {
      setError('Please enter your phone number')
      return
    }

    if (!/^\+?\d{10,15}$/.test(paymentData.phone_number.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number')
      return
    }

    setPaymentLoading(true)
    setError('')
    setSuccess('')

    try {
      const paymentResponse = await initiateActivation({
        user_id: userData.user_id,
        phone_number: paymentData.phone_number,
        amount: paymentData.amount
      })

      if (paymentResponse.success) {
        setSuccess('Payment initiated successfully! Please check your phone for M-Pesa prompt.')
        setCheckoutRequestId(paymentResponse.checkout_request_id)
        
        // Poll for activation status
        const pollActivation = async () => {
          const maxAttempts = 30 // 30 attempts * 5 seconds = 2.5 minutes
          let attempts = 0

          const interval = setInterval(async () => {
            try {
              attempts++
              const overview = await getOverview(userData.user_id)
              if (overview.is_activated) {
                clearInterval(interval)
                setSuccess('Account activated successfully! Redirecting to dashboard...')
                setTimeout(() => {
                  navigate('/dashboard')
                }, 2000)
              } else if (attempts >= maxAttempts) {
                clearInterval(interval)
                setError('Payment confirmation taking longer than expected. Please check your M-Pesa transactions and try again.')
              }
            } catch (error) {
              console.error('Error polling activation status:', error)
            }
          }, 5000) // Check every 5 seconds
        }

        pollActivation()
      } else {
        setError(paymentResponse.error || 'Failed to initiate payment')
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Payment failed. Please try again.')
      console.error('Payment error:', error)
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
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

  if (!userData || !userData.user_id) {
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

  if (userData.is_activated) {
    navigate('/dashboard')
    return null
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Account Activation
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Activate Your Account" 
                    avatar={<Verified sx={{ color: 'success.main' }} />}
                    sx={{ backgroundColor: 'success.light', color: 'white' }}
                  />
                  <CardContent>
                    <Typography variant="body1" sx={{ mb: 2, color: 'textSecondary' }}>
                      Activate your account to unlock all premium features and start earning!
                    </Typography>
                    
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        Activation Benefits:
                      </Typography>
                      <ul>
                        <li>Access to all job listings</li>
                        <li>Ability to apply for jobs</li>
                        <li>Withdraw earnings</li>
                        <li>Full messaging features</li>
                        <li>Premium support</li>
                      </ul>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Activation Fee: KSh {paymentData.amount}
                      </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        Enter your phone number for M-Pesa payment:
                      </Typography>
                      <TextField
                        fullWidth
                        label="Phone Number (e.g., 254712345678)"
                        value={paymentData.phone_number}
                        onChange={(e) => setPaymentData({...paymentData, phone_number: e.target.value})}
                        placeholder="254712345678"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button 
                        variant="contained" 
                        size="large" 
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        startIcon={paymentLoading ? null : <Payment />}
                        sx={{ flex: 1, backgroundColor: 'primary.main' }}
                      >
                        {paymentLoading ? <CircularProgress size={24} /> : 'Pay Now (M-Pesa)'}
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={handleSkip}
                        disabled={paymentLoading}
                        startIcon={<SkipNext />}
                        sx={{ flex: 1 }}
                      >
                        Skip for Now
                      </Button>
                    </Box>

                    {checkoutRequestId && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                        <Typography variant="body2" color="success.main">
                          <strong>Payment Request ID:</strong> {checkoutRequestId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Please check your phone for the M-Pesa prompt and complete the payment.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Payment Instructions" 
                    avatar={<AttachMoney sx={{ color: 'secondary.main' }} />}
                    sx={{ backgroundColor: 'secondary.light', color: 'white' }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      How to Pay via M-Pesa:
                    </Typography>
                    
                    <ol>
                      <li>Enter your phone number above</li>
                      <li>Click "Pay Now" button</li>
                      <li>You'll receive an M-Pesa prompt on your phone</li>
                      <li>Enter your M-Pesa PIN and confirm</li>
                      <li>Your account will be activated automatically after successful payment</li>
                    </ol>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      What You'll Get:
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f7f4', borderRadius: 1 }}>
                          <Chip 
                            icon={<Verified />}
                            label="Full Access" 
                            color="success" 
                            variant="outlined" 
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f7f4', borderRadius: 1 }}>
                          <Chip 
                            icon={<AttachMoney />}
                            label="Earn Money" 
                            color="success" 
                            variant="outlined" 
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f7f4', borderRadius: 1 }}>
                          <Chip 
                            icon={<Payment />}
                            label="Easy Payouts" 
                            color="success" 
                            variant="outlined" 
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f7f4', borderRadius: 1 }}>
                          <Chip 
                            icon={<SkipNext />}
                            label="Skip Option" 
                            color="warning" 
                            variant="outlined" 
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
                      <strong>Note:</strong> If you choose to skip, you can still browse the platform but won't be able to apply for jobs or access premium features until activation.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Alternative payment methods */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                  Alternative Payment Methods:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Coming soon: Bank transfer, credit card, and other payment options.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Activation