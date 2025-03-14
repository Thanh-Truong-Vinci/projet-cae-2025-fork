import { createContext, useState, ReactNode } from 'react'
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
  LoginUser,
} from '../types'

import {
  clearAuthenticatedUser,
  storeAuthenticatedUser,
} from '../utils/session'

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  authsMe: async () => {},
  registerUser: async () => {},
  loginUser: async () => {
    throw new Error('Context not initialized')
  },
  clearUser: () => {},
}

const UserContext = createContext<UserContextType>(defaultUserContext)

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(undefined)

  const authsMe = async (token: string): Promise<void> => {
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
  }

  const registerUser = async (newUser: User) => {
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

      const createdUser: AuthenticatedUser = await response.json()

      setAuthenticatedUser(createdUser)
      storeAuthenticatedUser(createdUser)
      console.log('createdUser: ', createdUser)
    } catch (err) {
      console.error('registerUser::error: ', err)
      throw err
    }
  }

  const loginUser = async (user: LoginUser): Promise<AuthenticatedUser> => {
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
      console.log('authenticatedUser: ', authenticatedUser)

      setAuthenticatedUser(authenticatedUser)
      storeAuthenticatedUser(authenticatedUser)
      return authenticatedUser
    } catch (err) {
      console.error('loginUser::error: ', err)
      throw err
    }
  }

  const clearUser = () => {
    clearAuthenticatedUser()
    setAuthenticatedUser(undefined)
  }

  const contextValue: UserContextType = {
    authenticatedUser,
    authsMe,
    registerUser,
    loginUser,
    clearUser,
  }

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export { UserContext, UserContextProvider }
