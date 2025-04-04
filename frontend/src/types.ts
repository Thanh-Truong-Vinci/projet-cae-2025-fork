interface UserContextType {
  authenticatedUser: MaybeAuthenticatedUser
  authsMe: (token: string) => Promise<void>
  registerUser: (newUser: User) => Promise<void>
  registerManager: (data: ManagerRegistrationData) => Promise<void>
  registerProducer: (data: ProducerRegistrationData) => Promise<void>
  loginUser: (
    user: LoginUser,
    rememberMe?: boolean
  ) => Promise<AuthenticatedUser>
  clearUser: () => void
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>
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

interface ManagerRegistrationData {
  name: string
  firstname: string
  email: string
  password: string
}

interface ProducerRegistrationData {
  name: string
  firstname: string
  company: string
  email: string
  password: string
  street: string
  number: string
  box?: string
  postalCode: string
  city: string
  country: string
  phoneNumber: string
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

export interface Product {
  id: number
  name: string
  price: string
  image: string
  category: string
  description: string
  unitType: string
}

export const categoryLabels: { [key: string]: string } = {
  legumes: 'Légumes',
  fruits: 'Fruits',
  boulangerie: 'Boulangerie',
  viande: 'Viande',
  produits_laitiers: 'Produits laitiers',
  boissons: 'Boissons',
  autres: 'Autres',
}

export interface CartItem {
  id: number
  name: string
  price: string
  image: string
  quantity: number
  unitType: string
  category: string
}

export interface ProductContextType {
  products: Product[]
  getProductById: (id: number) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getCategoryLabel: (category: string) => string
  isLoading: boolean
  error: string | null
}

type MaybeAuthenticatedUser = AuthenticatedUser | undefined

export type {
  User,
  ManagerRegistrationData,
  ProducerRegistrationData,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  UserContextType,
  LoginUser,
}
