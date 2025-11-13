import React from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

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
        <Typography component="h1" variant="h2" sx={{ color: 'primary.main', mb: 2 }}>
          404
        </Typography>
        <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'textSecondary' }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ backgroundColor: 'primary.main' }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound