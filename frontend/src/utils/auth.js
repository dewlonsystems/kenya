import { auth } from './firebase'
import { getIdToken } from 'firebase/auth'

export const getFirebaseToken = async () => {
  const user = auth.currentUser
  if (user) {
    try {
      const token = await user.getIdToken()
      return token
    } catch (error) {
      console.error('Error getting Firebase token:', error)
      return null
    }
  }
  return null
}