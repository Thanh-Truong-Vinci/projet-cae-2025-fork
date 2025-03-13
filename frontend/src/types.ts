interface Pizza {
  id: number
  title: string
  content: string
}

type NewPizza = Omit<Pizza, 'id'>

interface Drink {
  title: string
  image: string
  volume: string
  price: string
}

interface PizzeriaContext {
  pizzas: Pizza[]
  setPizzas: (pizzas: Pizza[]) => void
  actionToBePerformed: boolean
  setActionToBePerformed: (actionToBePerformed: boolean) => void
  clearActionToBePerformed: () => void
  drinks: Drink[]
  addPizza: (newPizza: NewPizza) => Promise<void>
}

interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser
  registerUser: (newUser: User) => Promise<void>
  loginUser: (user: User) => Promise<AuthenticatedUser>
  clearUser: () => void
}

interface User {
  login: string
  password: string
}

interface AuthenticatedUser {
  login: string
  token: string
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined

export type {
  Pizza,
  NewPizza,
  Drink,
  PizzeriaContext,
  User,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
}
