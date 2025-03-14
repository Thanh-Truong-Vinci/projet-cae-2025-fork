interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser
  authsMe: (token: string) => Promise<void>
  registerUser: (newUser: User) => Promise<void>
  loginUser: (user: LoginUser) => Promise<AuthenticatedUser>
  clearUser: () => void
}

interface User {
  nom: string
  prenom: string
  rue: string
  numeroRue: string
  boite?: string
  codePostal: string
  commune: string
  pays: string
  tel: string
  email: string
  password: string
}

interface AuthenticatedUser {
  email: string
  token: string
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
