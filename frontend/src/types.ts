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
  batchIds: number[]
}

export interface ProductContextType {
  products: ProductBatch[]
  getProductById: (id: number) => ProductBatch | undefined
  getProductsByCategory: (category: string) => ProductBatch[]
  getCategoryLabel: (category: string) => string
  isLoading: boolean
  error: string | null
}

export interface Batch {
  id: number
  productName: string
  productType: string
  imageUrl: string
  availabilityDate: string
  availableQuantity: number
  unitPrice: number
  unitType: string
  producerId: number
  producerName?: string
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED'
  rejectionReason?: string
}

export interface NewBatch {
  email: string
  productName: string
  productType: string
  productDescription: string
  availabilityDate: string
  unitPrice: number
  saleUnit: string
  availableQuantity: number
}

export interface ProductBatch {
  productId: number
  productName: string
  productType: string
  description: string
  unitPrice: number
  saleUnit: string
  totalQuantity: number
  imageLocation: string
  companyName: string
  earliestProductionDate: string
  batchIds: number[]
  batchQuantities: number[]
}

export interface BatchContextType {
  myBatches: Batch[]
  approvedBatches: Batch[]
  receivedBatches: Batch[] // Added receivedBatches state
  isLoading: boolean
  error: string | null
  fetchMyBatches: () => Promise<void>
  fetchApprovedBatches: () => Promise<void>
  fetchReceivedBatches: () => Promise<Batch[]> // Added fetch method for received batches
  receiveBatch: (batchId: number) => Promise<Batch | null>
  createBatch: (newBatch: NewBatch, image: File) => Promise<void>
  updateBatchImage: (batchId: number, image: File) => Promise<Batch | null>
  updateBatchImageById: (
    batchId: number,
    imageId: number
  ) => Promise<Batch | null>
}

export interface Photo {
  id: number
  imageLocation: string
  productName: string
}

export interface PhotoContextType {
  photos: Photo[]
  isLoading: boolean
  error: string | null
  fetchAllPhotos: () => Promise<void>
}

export interface Photo {
  id: number
  imageLocation: string
}

export interface PhotoContextType {
  photos: Photo[]
  isLoading: boolean
  error: string | null
  fetchAllPhotos: () => Promise<void>
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
