import {
  createContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
  LoginUser,
  ManagerRegistrationData,
  ProducerRegistrationData,
} from '../types'

import {
  clearAuthenticatedUser,
  storeAuthenticatedUser,
  getAuthenticatedUser,
} from '../utils/session'

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  authsMe: async () => {},
  registerUser: async () => {},
  registerManager: async () => {},
  registerProducer: async () => {},
  loginUser: async () => {
    throw new Error('Context not initialized')
  },
  clearUser: () => {},
  changePassword: async () => {},
}

const UserContext = createContext<UserContextType>(defaultUserContext)

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(getAuthenticatedUser())

  // Try to restore user from session on component mount
  useEffect(() => {
    const savedUser = getAuthenticatedUser()
    if (savedUser) {
      setAuthenticatedUser(savedUser)
    }
  }, [])

  const authsMe = useCallback(async (token: string): Promise<void> => {
    try {
      console.log('Validating token with server...')
      const response = await fetch('/api/auths/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: token, // Send the raw token string as the API expects
      })

      if (!response.ok) {
        console.error(
          'Token validation API error:',
          response.status,
          response.statusText
        )

        if (response.status === 401 || response.status === 403) {
          console.log('Clearing auth due to unauthorized response')
          clearAuthenticatedUser()
          setAuthenticatedUser(undefined)
        }

        throw new Error(`Token validation failed: ${response.status}`)
      }

      // API returns a new token as plain text, not JSON
      const newToken = await response.text()
      console.log('Token validation successful, received new token')

      // Update the stored user with the new token using functional update
      // to avoid dependency on authenticatedUser
      setAuthenticatedUser((prev) => {
        if (!prev) return prev

        const updatedUser = {
          ...prev,
          token: newToken,
        }

        // Update stored credentials with new token
        storeAuthenticatedUser(updatedUser, true)
        return updatedUser
      })
    } catch (error) {
      console.error('Token validation error:', error)
      throw error
    }
  }, []) // Remove authenticatedUser from dependencies

  const registerUser = useCallback(async (newUser: User) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      }

      const response = await fetch('/api/auths/register', options)

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`
        )
    } catch (err) {
      console.error('registerUser::error: ', err)
      throw err
    }
  }, [])

  const registerManager = useCallback(
    async (managerData: ManagerRegistrationData) => {
      // First try to get token from cookie
      let token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]

      // If token not found in cookie, try session storage
      if (!token) {
        const userJson = sessionStorage.getItem('user')
        if (userJson) {
          const userData = JSON.parse(userJson)
          token = userData.token
        }
      }

      try {
        // Check if we have a token
        if (!token) {
          throw new Error('No authentication token found')
        }

        const options = {
          method: 'POST',
          body: JSON.stringify(managerData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: token, // Just send the token without template literal
          },
        }

        const response = await fetch('/api/manager/registermanager', options)

        if (!response.ok)
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`
          )
      } catch (err) {
        console.error('registerManager::error: ', err)
        throw err
      }
    },
    []
  )

  const registerProducer = useCallback(
    async (producerData: ProducerRegistrationData) => {
      // First try to get token from cookie
      let token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]

      // If token not found in cookie, try session storage
      if (!token) {
        const userJson = sessionStorage.getItem('user')
        if (userJson) {
          const userData = JSON.parse(userJson)
          token = userData.token
        }
      }

      try {
        // Check if we have a token
        if (!token) {
          throw new Error('No authentication token found')
        }

        const options = {
          method: 'POST',
          body: JSON.stringify(producerData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: token, // Just send the token without template literal
          },
        }

        const response = await fetch('/api/manager/registerproducer', options)

        if (!response.ok)
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`
          )
      } catch (err) {
        console.error('registerProducer::error: ', err)
        throw err
      }
    },
    []
  )

  const loginUser = useCallback(
    async (user: LoginUser, rememberMe = false): Promise<AuthenticatedUser> => {
      try {
        console.log(
          'Logging in user:',
          user.email,
          'with rememberMe:',
          rememberMe
        )
        const options = {
          method: 'POST',
          body: JSON.stringify(user),
          headers: {
            'Content-Type': 'application/json',
          },
        }

        const response = await fetch('/api/auths/login', options)

        if (!response.ok) {
          console.error('Login failed:', response.status, response.statusText)
          throw new Error(`fetch error : ${response.status}`)
        }

        const authenticatedUser: AuthenticatedUser = await response.json()
        console.log('Login successful, storing user data')

        if (!authenticatedUser || !authenticatedUser.token) {
          console.error('Invalid authentication response')
          throw new Error('Invalid authentication data')
        }

        setAuthenticatedUser(authenticatedUser)
        storeAuthenticatedUser(authenticatedUser, rememberMe)
        return authenticatedUser
      } catch (err) {
        console.error('Login error:', err)
        throw err
      }
    },
    []
  )

  const clearUser = () => {
    clearAuthenticatedUser()
    setAuthenticatedUser(undefined)
  }

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      // First try to get token from cookie
      let token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]

      // If token not found in cookie, try session storage
      if (!token) {
        const userJson = sessionStorage.getItem('user')
        if (userJson) {
          const userData = JSON.parse(userJson)
          token = userData.token
        }
      }

      // Check if we have a token and user is authenticated
      if (!token || !authenticatedUser) {
        throw new Error('User not authenticated')
      }

      try {
        const options = {
          method: 'POST',
          body: JSON.stringify({
            email: authenticatedUser.email,
            currentPassword,
            newPassword,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: token, // Just send the token without template literal
          },
        }

        const response = await fetch('/api/auths/changepassword', options)

        if (!response.ok)
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`
          )
      } catch (err) {
        console.error('changePassword::error: ', err)
        throw err
      }
    },
    [authenticatedUser]
  )

  const contextValue: UserContextType = {
    authenticatedUser,
    authsMe,
    registerManager,
    registerProducer,
    registerUser,
    loginUser,
    clearUser,
    changePassword,
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export { UserContext, UserContextProvider }
