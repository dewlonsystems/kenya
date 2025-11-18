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
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true) // Always start loading

  useEffect(() => {
    // Listen for firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // No user → logged out
      if (!user) {
        setCurrentUser(null)
        setUserData(null)
        setLoading(false)
        return
      }

      try {
        // Get Firebase token (force refresh ensures we don't use expired tokens)
        const token = await user.getIdToken(true)

        // Verify with your Django backend
        const response = await verifyFirebaseAuth(token)

        // Backend cannot verify token → treat as logged out
        if (!response || !response.user_exists) {
          setCurrentUser(null)
          setUserData(null)
          setLoading(false)
          return
        }

        // User exists → fetch profile
        try {
          const profile = await getUserProfile(response.user_id)

          setUserData({
            ...profile,
            user_id: response.user_id
          })
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)

          // If profile fetch fails, fallback to minimal data
          setUserData({
            user_id: response.user_id,
            email: response.email,
            firebase_uid: response.firebase_uid,
            auth_method: response.auth_method,
            is_activated: response.is_activated || false,
            earnings_wallet: 0,
            referral_wallet: 0,
            full_name: response.email?.split('@')[0] || "New User",
            rating: 0,
            total_reviews: 0
          })
        }

        setCurrentUser(user)

      } catch (err) {
        console.error("Auth verification failed:", err)
        // Error → ensure user is logged out
        setCurrentUser(null)
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
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
