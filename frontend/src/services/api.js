import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Export individual functions
export const verifyFirebaseAuth = async (idToken) => {
  const response = await api.post('/verify-firebase-auth/', {
    idToken
  })
  return response.data
}

export const completeProfile = async (profileData) => {
  const response = await api.post('/complete-profile/', profileData)
  return response.data
}

export const initiateActivation = async (paymentData) => {
  const response = await api.post('/initiate-activation/', paymentData)
  return response.data
}

export const getOverview = async (userId) => {
  const response = await api.get(`/overview/?user_id=${userId}`)
  return response.data
}

export const requestWithdrawal = async (withdrawalData) => {
  const response = await api.post('/request-withdrawal/', withdrawalData)
  return response.data
}

export const updateProfile = async (profileData) => {
  const response = await api.post('/update-profile/', profileData)
  return response.data
}

export const searchUser = async (searchTerm) => {
  const response = await api.post('/search-user/', { search_term: searchTerm })
  return response.data
}

export const sendMessage = async (messageData) => {
  const response = await api.post('/send-message/', messageData)
  return response.data
}

export const getMessages = async (userId) => {
  const response = await api.get(`/get-messages/?user_id=${userId}`)
  return response.data
}

export const getNotifications = async (userId) => {
  const response = await api.get(`/notifications/?user_id=${userId}`)
  return response.data
}

export const createJob = async (jobData) => {
  const response = await api.post('/create-job/', jobData)
  return response.data
}

export const getJobs = async (filters = {}) => {
  const params = new URLSearchParams(filters)
  const response = await api.get(`/get-jobs/?${params}`)
  return response.data
}

export const applyToJob = async (applicationData) => {
  const response = await api.post('/apply-to-job/', applicationData)
  return response.data
}

// Updated addSkill function (only one declaration)
export const addSkill = async (skillData) => {
  const response = await api.post('/add-skill/', skillData)
  return response.data
}

export const addPortfolioItem = async (formData) => {
  const response = await api.post('/add-portfolio-item/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const submitReview = async (reviewData) => {
  const response = await api.post('/submit-review/', reviewData)
  return response.data
}

export const createDispute = async (disputeData) => {
  const response = await api.post('/create-dispute/', disputeData)
  return response.data
}

export const getUserProfile = async (userId) => {
  const response = await api.get(`/get-user-profile/?user_id=${userId}`)
  return response.data
}

export const getJobApplications = async (userId) => {
  const response = await api.get(`/get-job-applications/?user_id=${userId}`)
  return response.data
}

export const getAssignedJobs = async (userId) => {
  const response = await api.get(`/get-assigned-jobs/?user_id=${userId}`)
  return response.data
}

export const getUserReviews = async (userId) => {
  const response = await api.get(`/get-user-reviews/?user_id=${userId}`)
  return response.data
}

export const getWalletTransactions = async (userId) => {
  const response = await api.get(`/wallet-transactions/?user_id=${userId}`)
  return response.data
}

export const getWithdrawalHistory = async (userId) => {
  const response = await api.get(`/withdrawal-history/?user_id=${userId}`)
  return response.data
}

export const getUserStatus = async (userId) => {
  const response = await api.get(`/user-status/?user_id=${userId}`)
  return response.data
}

// Also export the api instance if needed
export default api