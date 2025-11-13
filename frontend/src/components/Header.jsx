import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Box, Avatar } from '@mui/material'
import { AccountCircle, Notifications, Menu as MenuIcon, Close } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function Header() {
  const { userData, currentUser } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    // Firebase logout will be handled by AuthContext
    handleClose()
  }

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'primary.main',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        mb: 2
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography 
            variant="h6" 
            component={Link}
            to="/dashboard"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 600,
              mr: 4
            }}
          >
            Freelance Kenya
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="large" 
            aria-label="show 0 new notifications" 
            color="inherit"
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={0} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose} component={Link} to="/profile">Profile</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/wallet">Wallet</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/messages">Messages</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header