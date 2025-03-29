import { createContext, useState, ReactNode, useCallback } from 'react'
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
    useState<MaybeAuthenticatedUser>(undefined)

  const authsMe = useCallback(async (token: string): Promise<void> => {
    try {
      const response = await fetch('/api/auths/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`
        )

      const authenticatedUser: AuthenticatedUser = await response.json()

      setAuthenticatedUser(authenticatedUser)
      storeAuthenticatedUser(authenticatedUser)
    } catch (error) {
      console.error('Token validation failed:', error)
      throw error
    }
  }, [])

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
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]
      try {
        const options = {
          method: 'POST',
          body: JSON.stringify(managerData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        }

        const response = await fetch('/api/auths/registermanager', options)

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
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]
      try {
        const options = {
          method: 'POST',
          body: JSON.stringify(producerData),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        }

        const response = await fetch('/api/auths/registerproducer', options)

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
    async (user: LoginUser): Promise<AuthenticatedUser> => {
      try {
        const options = {
          method: 'POST',
          body: JSON.stringify(user),
          headers: {
            'Content-Type': 'application/json',
          },
        }

        const response = await fetch('/api/auths/login', options)

        if (!response.ok)
          throw new Error(
            `fetch error : ${response.status} : ${response.statusText}`
          )

        const authenticatedUser: AuthenticatedUser = await response.json()

        document.cookie = `token=${authenticatedUser.token}; timestamp=${Date.now()}`

        setAuthenticatedUser(authenticatedUser)
        storeAuthenticatedUser(authenticatedUser)
        return authenticatedUser
      } catch (err) {
        console.error('loginUser::error: ', err)
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
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]
      try {
        const options = {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
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
    []
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
