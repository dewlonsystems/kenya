const theme = createTheme({
  palette: {
    primary: {
      main: '#1a3a2c',  // Dark green
      light: '#2a5a4a',
      dark: '#0d1f18'
    },
    secondary: {
      main: '#4caf50',  // Light green
      light: '#81c784',
      dark: '#388e3c'
    },
    background: {
      default: '#f8f9f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a3a2c',
      secondary: '#4a6d5a',
      disabled: '#a0a0a0'
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
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