import React from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', color: 'primary.main', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" sx={{ color: 'primary.main', mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ backgroundColor: 'primary.main' }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound