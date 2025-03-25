interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser
  authsMe: (token: string) => Promise<void>
  registerUser: (newUser: User) => Promise<void>
  loginUser: (user: LoginUser) => Promise<AuthenticatedUser>
  clearUser: () => void
}

interface User {
  name: string
  firstname: string
  civility: string
  street: string
  number: string
  box?: string
  postalCode: string
  city: string
  country: string
  phoneNumber: string
  email: string
  password: string
}

interface AuthenticatedUser {
  email: string
  name: string
  firstname: string
  token: string
  role: string
}

interface LoginUser {
  email: string
  password: string
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined

export type {
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  LoginUser,
}
