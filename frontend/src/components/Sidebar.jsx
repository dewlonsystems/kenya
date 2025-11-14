import React, { useState } from 'react'
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { 
  Dashboard, 
  Work, 
  AccountBalanceWallet, 
  Message, 
  Person, 
  Logout,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'

const drawerWidth = 240

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Jobs', icon: <Work />, path: '/jobs' },
    { text: 'Wallet', icon: <AccountBalanceWallet />, path: '/wallet' },
    { text: 'Messages', icon: <Message />, path: '/messages' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ]

  const isActive = (path) => location.pathname === path

  // Mobile drawer
  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true // Better performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          backgroundColor: 'primary.light',
          color: 'white',
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          Freelance Kenya
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white'
          }}
        >
          <Close />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={Link} 
              to={item.path}
              onClick={handleDrawerToggle}
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

  // Desktop drawer
  const desktopDrawer = (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: 'primary.light', 
          color: 'white' 
        },
        display: { xs: 'none', md: 'block' }
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

  return (
    <>
      {/* Top App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1,
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            Freelance Kenya
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer - hidden on mobile */}
      {desktopDrawer}

      {/* Mobile Drawer */}
      {mobileDrawer}
    </>
  )
}

export default Sidebar