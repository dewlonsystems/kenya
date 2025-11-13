import React from 'react'
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from '@mui/material'
import { Dashboard, Work, AccountBalanceWallet, Message, Person, Logout } from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 240

function Sidebar() {
  const location = useLocation()
  const { currentUser, userData } = useAuth()
  
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Jobs', icon: <Work />, path: '/jobs' },
    { text: 'Wallet', icon: <AccountBalanceWallet />, path: '/wallet' },
    { text: 'Messages', icon: <Message />, path: '/messages' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: 'primary.light', color: 'white' },
      }}
    >
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Freelance Kenya
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              sx={{ 
                backgroundColor: isActive(item.path) ? 'secondary.main' : 'transparent',
                '&:hover': { backgroundColor: 'secondary.dark' },
                borderRadius: 1,
                mx: 1,
                mb: 0.5
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => {
              // Firebase logout will be handled by AuthContext
              window.location.href = '/'
            }}
            sx={{ 
              '&:hover': { backgroundColor: 'error.light' },
              borderRadius: 1,
              mx: 1,
              mt: 2
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: 'white' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

export default Sidebar