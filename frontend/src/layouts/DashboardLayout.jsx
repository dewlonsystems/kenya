import React from 'react'
import { Box } from '@mui/material'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: '#f8f9f7',
          overflow: 'auto',
          mt: 8,
          ml: { xs: 0, md: 30 } // Account for sidebar on medium+ screens
        }}
      >
        <Header />
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout