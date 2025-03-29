import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types'

const storeAuthenticatedUser = (
  authenticatedUser: AuthenticatedUser,
  rememberMe = false
) => {
  console.log('Storing user data with rememberMe:', rememberMe)

  if (rememberMe) {
    // For remembered sessions - long expiration (1 year)
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    // Store token in cookie with long expiration
    document.cookie = `token=${authenticatedUser.token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`

    // Store full user data in localStorage (persists after browser close)
    localStorage.setItem(
      'user',
      JSON.stringify({
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        firstname: authenticatedUser.firstname,
        role: authenticatedUser.role,
        token: authenticatedUser.token,
      })
    )

    // Clean up any session storage to avoid conflicts
    sessionStorage.removeItem('user')
    console.log('User data stored in localStorage (persistent)')
  } else {
    // For non-remembered sessions, use memory only - clear any cookies/storage
    // Do NOT set a token cookie at all
    clearAuthenticatedUser()

    // Store user data in sessionStorage only (for current session access)
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        firstname: authenticatedUser.firstname,
        role: authenticatedUser.role,
        token: authenticatedUser.token,
      })
    )
    console.log('User data stored in sessionStorage only (volatile)')
  }
}

const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  // First check for persistent login (localStorage + cookie)
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith('token=')
  )
  const token = tokenCookie ? tokenCookie.trim().split('=')[1] : null

  // If we have a token in cookies, use localStorage data
  if (token) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        return {
          ...userData,
          token,
        }
      } catch (error) {
        console.error('Error parsing localStorage user data:', error)
        clearAuthenticatedUser()
      }
    }
  }

  // No persistent login found
  return undefined
}

const clearAuthenticatedUser = () => {
  // Set token cookie to expire immediately
  document.cookie =
    'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=-1'

  // Clear both storage types
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser }
