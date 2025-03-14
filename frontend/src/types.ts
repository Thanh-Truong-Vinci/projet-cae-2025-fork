interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser
  registerUser: (newUser: User) => Promise<void>
  loginUser: (user: User) => Promise<AuthenticatedUser>
  clearUser: () => void
}

interface User {
  email: string
  password: string
}

interface AuthenticatedUser {
  email: string
  token: string
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined

export type {
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
}
