import React from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid,
  Paper,
  Avatar,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { 
  Work, 
  AttachMoney, 
  People, 
  Verified, 
  TrendingUp, 
  Dashboard, 
  Login as LoginIcon
} from '@mui/icons-material'
import { Link } from 'react-router-dom'

function LandingPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9f7' }}>
      {/* Topbar */}
      <Box 
        sx={{ 
          py: 2, 
          px: 3,
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Freelance Kenya
            </Typography>
            
            <Button 
              component={Link}
              to="/"
              variant="contained" 
              startIcon={<LoginIcon />}
              sx={{ 
                backgroundColor: 'primary.main',
                '&:hover': { backgroundColor: 'primary.dark' }
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 8, md: 12 }, 
        pb: { xs: 8, md: 16 },
        backgroundImage: 'linear-gradient(135deg, #e8f5e9 0%, #f0f7f4 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}>
                Find Your Next Job in Kenya
              </Typography>
              
              <Typography variant="h5" component="h2" gutterBottom sx={{ 
                fontWeight: 500, 
                color: 'text.secondary',
                mb: 4,
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}>
                Connect with clients and freelancers across Kenya. Start earning or hire top talent today.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                <Button 
                  component={Link}
                  to="/"
                  variant="contained" 
                  size="large"
                  sx={{ 
                    backgroundColor: 'primary.main',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  Get Started Now
                </Button>
                
                <Button 
                  component={Link}
                  to="/"
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': { 
                      backgroundColor: 'rgba(26, 58, 44, 0.04)',
                      borderColor: 'primary.dark'
                    }
                  }}
                >
                  Browse Jobs
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
                  <Work />
                </Avatar>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'success.main' }}>
                  <AttachMoney />
                </Avatar>
                <Typography variant="body2" color="textSecondary">
                  Join over 5,000 Kenyan freelancers already earning on our platform
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Freelancer working" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Why Choose Freelance Kenya?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Work sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Flexible Work
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Work from anywhere in Kenya. Set your own schedule and choose projects that match your skills and interests.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Earn More
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Keep more of what you earn with low platform fees. Get paid securely via M-Pesa and other payment methods.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%', 
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Verified sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Verified Platform
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Secure authentication with Firebase. Safe transactions and verified users ensure trust across the platform.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        backgroundColor: '#f0f7f4'
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            How It Works
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                backgroundColor: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1552664199-fd3e8d6895e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="How it works" 
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
              <Box sx={{ pl: { md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ 
                    minWidth: 36, 
                    height: 36, 
                    backgroundColor: 'primary.main', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2, 
                    mt: 0.5 
                  }}>
                    1
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Create Your Profile
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Sign up with Google, email, or phone. Complete your profile with your skills, experience, and portfolio.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ 
                    minWidth: 36, 
                    height: 36, 
                    backgroundColor: 'primary.main', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2, 
                    mt: 0.5 
                  }}>
                    2
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Find or Offer Work
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Browse thousands of job opportunities or post your own project. Apply to jobs that match your expertise.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Box sx={{ 
                    minWidth: 36, 
                    height: 36, 
                    backgroundColor: 'primary.main', 
                    color: 'white', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2, 
                    mt: 0.5 
                  }}>
                    3
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                      Get Paid Securely
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Receive payments through secure channels like M-Pesa. Track your earnings and withdraw when ready.
                    </Typography>
                  </Box>
                </Box>
                
                <Button 
                  component={Link}
                  to="/"
                  variant="contained" 
                  size="large"
                  sx={{ 
                    mt: 2,
                    backgroundColor: 'primary.main',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    '&:hover': { backgroundColor: 'primary.dark' }
                  }}
                >
                  Join Today - It's Free!
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ 
            fontWeight: 600, 
            color: 'primary.main',
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Success Stories
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  backgroundColor: '#f0f7f4'
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "I've earned over KSh 200,000 in just 6 months. The platform has connected me with amazing clients."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <People />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Sarah W.</Typography>
                    <Typography variant="body2" color="textSecondary">Web Developer</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  backgroundColor: '#f0f7f4'
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "As a small business owner, I found skilled freelancers who helped grow my company without hiring full-time staff."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Work />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>David M.</Typography>
                    <Typography variant="body2" color="textSecondary">Business Owner</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  backgroundColor: '#f0f7f4'
                }}
              >
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  "The referral system is incredible! I've made an extra KSh 15,000 by inviting other freelancers to the platform."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AttachMoney />
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>John K.</Typography>
                    <Typography variant="body2" color="textSecondary">Graphic Designer</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>5,000+</Typography>
                <Typography variant="h6" color="textSecondary">Active Freelancers</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>1,200+</Typography>
                <Typography variant="h6" color="textSecondary">Companies</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>KSh 50M+</Typography>
                <Typography variant="h6" color="textSecondary">Paid Out</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>98%</Typography>
                <Typography variant="h6" color="textSecondary">Satisfaction</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 4, 
          px: 3,
          backgroundColor: 'primary.main',
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 600 }}>
                Freelance Kenya
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Connecting Kenyan talent with opportunities worldwide.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  component={Link}
                  to="/" 
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Home
                </Button>
                <Button 
                  component={Link}
                  to="/"
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Find Work
                </Button>
                <Button 
                  component={Link}
                  to="/" 
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Us
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                support@freelancekenya.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Nairobi, Kenya
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.2)', 
            pt: 3,
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2025 Freelance Kenya. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage