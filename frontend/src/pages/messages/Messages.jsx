import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Alert,
  CircularProgress
} from '@mui/material'
import { Message as MessageIcon, Person, Send } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { getMessages, sendMessage, searchUser } from '../../services/api'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'

function Messages() {
  const { userData } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState({ content: '', recipient_id: '', subject: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [messageError, setMessageError] = useState('')
  const [messageLoading, setMessageLoading] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [userData])

  const fetchMessages = async () => {
    try {
      if (userData) {
        const response = await getMessages(userData.user_id)
        setMessages(response.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    try {
      const response = await searchUser(searchTerm.trim())
      if (response.user_found) {
        setSearchResults([response])
        setSelectedUser(response)
      } else {
        setSearchResults([])
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error searching user:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) {
      setMessageError('Message content is required')
      return
    }

    if (!newMessage.recipient_id) {
      setMessageError('Please select a recipient')
      return
    }

    try {
      setMessageLoading(true)
      setMessageError('')

      const messageData = {
        sender_id: userData.user_id,
        recipient_id: newMessage.recipient_id,
        content: newMessage.content,
        subject: newMessage.subject
      }

      await sendMessage(messageData)
      
      // Reset form
      setNewMessage({ content: '', recipient_id: '', subject: '' })
      setSelectedUser(null)
      setSearchTerm('')
      setSearchResults([])
      setSearchDialogOpen(false)
      
      // Refetch messages
      fetchMessages()
    } catch (error) {
      setMessageError(error.response?.data?.error || 'Failed to send message')
      console.error(error)
    } finally {
      setMessageLoading(false)
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
              Messages
            </Typography>

            {/* Send Message Button */}
            <Box sx={{ mb: 3 }}>
              <Button 
                variant="contained" 
                startIcon={<Send />}
                onClick={() => setSearchDialogOpen(true)}
              >
                Send New Message
              </Button>
            </Box>

            {/* Messages List */}
            <Card>
              <CardContent>
                {messages.length === 0 ? (
                  <Typography variant="body1" align="center" color="textSecondary">
                    No messages yet. Start a conversation!
                  </Typography>
                ) : (
                  <List>
                    {messages.map((message) => (
                      <React.Fragment key={message.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>
                              <Person />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  From: {message.sender}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {new Date(message.sent_at).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <>
                                {message.subject && (
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {message.subject}
                                  </Typography>
                                )}
                                <Typography variant="body2" color="textSecondary">
                                  {message.content}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Send Message Dialog */}
          <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Send New Message</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Search Recipient (Email or Referral Code)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button onClick={handleSearch} variant="outlined" sx={{ mb: 2 }}>
                  Search
                </Button>

                {selectedUser && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body1">
                      <strong>Selected:</strong> {selectedUser.full_name} ({selectedUser.email})
                    </Typography>
                  </Box>
                )}

                {messageError && <Alert severity="error" sx={{ mb: 2 }}>{messageError}</Alert>}

                <TextField
                  fullWidth
                  label="Subject (Optional)"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message Content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  sx={{ mb: 2 }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSearchDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSendMessage} 
                disabled={messageLoading || !selectedUser || !newMessage.content.trim()}
                variant="contained"
                startIcon={<Send />}
              >
                {messageLoading ? <CircularProgress size={24} /> : 'Send Message'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  )
}

export default Messages