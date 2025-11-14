import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3a2c',  // Dark green (your preference)
      light: '#2a5a4a',
      dark: '#0d1f18'
    },
    secondary: {
      main: '#4caf50',  // Light green accent
      light: '#81c784',
      dark: '#388e3c'
    },
    background: {
      default: '#f8f9f7', // Soft off-white background
      paper: '#ffffff',
    },
    text: {
      primary: '#1a3a2c',
      secondary: '#4a6d5a',
      disabled: '#a0a0a0'
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { 
      fontSize: '2.5rem', 
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: { 
      fontSize: '2rem', 
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: { 
      fontSize: '1.75rem', 
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: { 
      fontSize: '1.5rem', 
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: { 
      fontSize: '1.25rem', 
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: { 
      fontSize: '1.125rem', 
      fontWeight: 600,
      lineHeight: 1.6
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    }
  },
  shape: {
    borderRadius: 12, // Rounded corners everywhere
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
})

// This is the crucial part - you need to EXPORT the theme
export default theme