import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material'
import { Work, AttachMoney, AccessTime, LocationOn, Person } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { getJobs, applyToJob } from '../../services/api'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

function Jobs() {
  const { userData } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    min_budget: '',
    max_budget: '',
    search_term: ''
  })
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false)
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    hourly_rate: '',
    fixed_price: ''
  })
  const [applicationError, setApplicationError] = useState('')
  const [applicationLoading, setApplicationLoading] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    try {
      const response = await getJobs(filters)
      setJobs(response.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const handleApplyClick = (job) => {
    setSelectedJob(job)
    setApplicationDialogOpen(true)
  }

  const handleApplicationSubmit = async () => {
    if (!applicationData.cover_letter) {
      setApplicationError('Cover letter is required')
      return
    }

    try {
      setApplicationLoading(true)
      setApplicationError('')

      const applicationDataToSend = {
        freelancer_id: userData.user_id,
        job_id: selectedJob.id,
        cover_letter: applicationData.cover_letter,
        hourly_rate: applicationData.hourly_rate || null,
        fixed_price: applicationData.fixed_price || null
      }

      await applyToJob(applicationDataToSend)
      setApplicationDialogOpen(false)
      setApplicationData({ cover_letter: '', hourly_rate: '', fixed_price: '' })
      // Optionally refetch jobs to update applicant counts
      fetchJobs()
    } catch (error) {
      setApplicationError(error.response?.data?.error || 'Failed to submit application')
      console.error(error)
    } finally {
      setApplicationLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress />
            </Box>
          </Container>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Available Jobs
            </Typography>

            {/* Filters */}
            <Card sx={{ mb: 4, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Search Jobs"
                    name="search_term"
                    value={filters.search_term}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Min Budget"
                    name="min_budget"
                    type="number"
                    value={filters.min_budget}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Max Budget"
                    name="max_budget"
                    type="number"
                    value={filters.max_budget}
                    onChange={handleFilterChange}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      <MenuItem value="web-development">Web Development</MenuItem>
                      <MenuItem value="mobile-development">Mobile Development</MenuItem>
                      <MenuItem value="design">Design</MenuItem>
                      <MenuItem value="writing">Writing</MenuItem>
                      <MenuItem value="marketing">Marketing</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Card>

            {/* Jobs List */}
            <Grid container spacing={3}>
              {jobs.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="h6" align="center" color="textSecondary">
                    No jobs found matching your criteria.
                  </Typography>
                </Grid>
              ) : (
                jobs.map((job) => (
                  <Grid item xs={12} md={6} key={job.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ color: 'primary.main', fontWeight: 600 }}>
                            {job.title}
                          </Typography>
                          {job.is_urgent && (
                            <Chip 
                              label="Urgent" 
                              color="error" 
                              size="small" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {job.description.substring(0, 100)}...
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Person sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">
                            {job.client_name} (Rating: {job.client_rating.toFixed(1)})
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoney sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">
                            Budget: KSh {job.budget_min} - KSh {job.budget_max}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Work sx={{ fontSize: 16, mr: 1 }} />
                          <Typography variant="body2">
                            {job.payment_type === 'hourly' 
                              ? `Hourly: ${job.estimated_hours} hours` 
                              : `Fixed Price: ${job.duration || 'Project-based'}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          {job.skills_required.map((skill) => (
                            <Chip 
                              key={skill.id} 
                              label={skill.name} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>

                        <Typography variant="body2" color="textSecondary">
                          {job.applicants_count} applicants • Posted {new Date(job.created_at).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => handleApplyClick(job)}
                          disabled={!userData.is_activated}
                        >
                          Apply Now
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            {/* Application Dialog */}
            <Dialog open={applicationDialogOpen} onClose={() => setApplicationDialogOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>Apply to Job: {selectedJob?.title}</DialogTitle>
              <DialogContent>
                {applicationError && <Alert severity="error" sx={{ mb: 2 }}>{applicationError}</Alert>}
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Cover Letter"
                  value={applicationData.cover_letter}
                  onChange={(e) => setApplicationData({...applicationData, cover_letter: e.target.value})}
                  sx={{ mb: 2 }}
                />
                
                {selectedJob?.payment_type === 'hourly' ? (
                  <TextField
                    fullWidth
                    label="Hourly Rate (KSh)"
                    type="number"
                    value={applicationData.hourly_rate}
                    onChange={(e) => setApplicationData({...applicationData, hourly_rate: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label="Fixed Price (KSh)"
                    type="number"
                    value={applicationData.fixed_price}
                    onChange={(e) => setApplicationData({...applicationData, fixed_price: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setApplicationDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleApplicationSubmit} 
                  disabled={applicationLoading}
                  variant="contained"
                >
                  {applicationLoading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default Jobs