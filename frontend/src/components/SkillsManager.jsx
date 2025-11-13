import React, { useState } from 'react'
import { 
  Card, 
  CardHeader, 
  CardContent, 
  TextField, 
  Button, 
  Grid, 
  Chip, 
  Box,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Rating,
  Typography  // Add this import
} from '@mui/material'
import { Work, Add } from '@mui/icons-material'
import { addSkill } from '../services/api'

function SkillsManager({ userData, onSkillsUpdate }) {
  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    proficiency_level: 3,
    years_experience: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setSkillForm({
      ...skillForm,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await addSkill({
        user_id: userData.user_id,
        skill_name: skillForm.skill_name,
        proficiency_level: parseInt(skillForm.proficiency_level),
        years_experience: parseInt(skillForm.years_experience)
      })
      
      setSuccess('Skill added successfully!')
      setSkillForm({
        skill_name: '',
        proficiency_level: 3,
        years_experience: 0
      })
      
      // Refresh skills
      if (onSkillsUpdate) {
        onSkillsUpdate()
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add skill')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader 
        title="Skills & Expertise" 
        avatar={<Work sx={{ color: 'secondary.main' }} />}
        sx={{ backgroundColor: 'secondary.light', color: 'white' }}
      />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        {/* Add new skill form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Skill Name"
                name="skill_name"
                value={skillForm.skill_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Proficiency</InputLabel>
                <Select
                  name="proficiency_level"
                  value={skillForm.proficiency_level}
                  onChange={handleChange}
                  label="Proficiency"
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <MenuItem key={level} value={level}>
                      {level} Star{level > 1 ? 's' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Years Exp"
                name="years_experience"
                type="number"
                value={skillForm.years_experience}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={loading}
                startIcon={<Add />}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Skills list */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {userData?.skills?.map((skill) => (
            <Chip
              key={skill.skill_id}
              label={`${skill.skill_name} (${skill.proficiency_level}/5 stars, ${skill.years_experience} years)`}
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
          {(!userData?.skills || userData.skills.length === 0) && (
            <Typography variant="body2" color="textSecondary">
              No skills added yet
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default SkillsManager