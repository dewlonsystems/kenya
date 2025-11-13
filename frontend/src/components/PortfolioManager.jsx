import React, { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  TextField, 
  Button, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Box,
  Alert,
  Link,
  Typography  // Add this import
} from '@mui/material'
import { Add, Link as LinkIcon } from '@mui/icons-material'
import { addPortfolioItem } from '../services/api'

function PortfolioManager({ userData, onPortfolioUpdate }) {
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    project_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setPortfolioForm({
      ...portfolioForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('user_id', userData.user_id)
      formData.append('title', portfolioForm.title)
      formData.append('description', portfolioForm.description)
      formData.append('project_url', portfolioForm.project_url)

      await addPortfolioItem(formData)
      
      setSuccess('Portfolio item added successfully!')
      setPortfolioForm({
        title: '',
        description: '',
        project_url: ''
      })
      
      // Refresh portfolio
      if (onPortfolioUpdate) {
        onPortfolioUpdate()
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add portfolio item')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader 
        title="Portfolio" 
        avatar={<Add sx={{ color: 'success.main' }} />}
        sx={{ backgroundColor: 'success.light', color: 'white' }}
      />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {/* Add new portfolio item form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Title"
                name="title"
                value={portfolioForm.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project URL (Optional)"
                name="project_url"
                value={portfolioForm.project_url}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={portfolioForm.description}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                startIcon={<Add />}
              >
                Add Portfolio Item
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Portfolio list */}
        <List>
          {userData?.portfolio?.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="textPrimary">
                      {item.description}
                    </Typography>
                    {item.project_url && (
                      <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                        (<Link href={item.project_url} target="_blank" underline="hover">
                          View Project <LinkIcon fontSize="small" />
                        </Link>)
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Typography variant="caption" color="textSecondary">
                  {new Date(item.created_at).toLocaleDateString()}
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {(!userData?.portfolio || userData.portfolio.length === 0) && (
            <ListItem>
              <ListItemText primary="No portfolio items added yet" />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  )
}

export default PortfolioManager