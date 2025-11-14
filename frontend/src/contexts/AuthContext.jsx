import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../utils/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { verifyFirebaseAuth, getUserProfile } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true) // Always start as loading
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Set a timeout to ensure we don't stay in loading state forever
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 3000) // 3 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout) // Clear timeout if auth state changes
      
      if (user) {
        try {
          const token = await user.getIdToken()
          const response = await verifyFirebaseAuth(token)
          
          if (response.user_exists && response.user_id) {
            // User exists in database, get their profile
            try {
              const profileResponse = await getUserProfile(response.user_id)
              setUserData({
                ...profileResponse,
                user_id: response.user_id
              })
            } catch (profileError) {
              console.error('Error fetching user profile:', profileError)
              // If profile fetch fails, set basic user data
              setUserData({
                user_id: response.user_id,
                email: response.email,
                firebase_uid: response.firebase_uid,
                auth_method: response.auth_method,
                is_activated: response.is_activated || false,
                earnings_wallet: 0,
                referral_wallet: 0,
                full_name: response.email.split('@')[0] || 'New User',
                rating: 0,
                total_reviews: 0
              })
            }
          } else {
            // New user - hasn't completed profile yet
            setUserData({
              email: response.email,
              firebase_uid: response.firebase_uid,
              auth_method: response.auth_method,
              user_exists: response.user_exists,
              user_id: response.user_id, // This will be null for new users
              is_activated: false,
              earnings_wallet: 0,
              referral_wallet: 0,
              full_name: response.email.split('@')[0] || 'New User'
            })
          }
          
          setCurrentUser(user)
        } catch (error) {
          console.error('Error during auth state change:', error)
          setCurrentUser(null)
          setUserData(null)
        }
      } else {
        setCurrentUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    // Cleanup function
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    userData,
    setUserData,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}