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
  image: string
  description: string
  productType?: ProductType
  type?: {
    id: number
    title: string
  }
  photo?: {
    id: number
    productName: string
    imageLocation: string
  }
}

export interface ProductType {
  id: number
  title: string
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
  allProducts: Product[]
  loadingAllProducts: boolean
  getProductById: (id: number) => ProductBatch | undefined
  getProductsByCategory: (category: string) => ProductBatch[]
  getCategoryLabel: (category: string) => string
  fetchAllProducts: () => Promise<void>
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

export interface PendingBatch {
  id: number
  productName: string
  productType: string
  imageLocation: string
  description: string
  availabilityDate: string
  availableQuantity: number
  unitPrice: number
  unitType: string
  producerId: number
  producerName: string
  createdAt: string
}

export interface BatchContextType {
  myBatches: Batch[]
  pendingBatches: PendingBatch[]
  approvedBatches: Batch[]
  receivedBatches: Batch[]
  isLoading: boolean
  error: string | null
  fetchPendingBatches: () => Promise<void>
  fetchApprovedBatches: () => Promise<void>
  fetchMyBatches: () => Promise<void>
  fetchReceivedBatches: () => Promise<Batch[]>
  receiveBatch: (batchId: number) => Promise<Batch | null>
  createBatch: (newBatch: NewBatch, image: File) => Promise<void>
  createBatchWithExistingProduct: (
    newBatch: NewBatch,
    productId: number
  ) => Promise<void>
  updateBatchImage: (batchId: number, image: File) => Promise<Batch | null>
  updateBatchImageById: (
    batchId: number,
    imageId: number
  ) => Promise<Batch | null>
  acceptBatch: (batchId: number) => Promise<void>
  rejectBatch: (batchId: number, rejectionReason: string) => Promise<void>
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

// Reservation interfaces
export interface Reservation {
  id: number
  client?: {
    id: number
    name: string
    firstname: string
  }
  status: string
  reservationDate: string
  saleDate?: string
  price: number
  reservationLines: ReservationLine[]
}

export interface ReservationLine {
  id: number
  quantity: number
  batch: Batch
}

export interface ReservationRequest {
  productId: number
  quantity: number
}

export interface ReservationContextType {
  reservations: Reservation[]
  isLoading: boolean
  error: string | null
  fetchReservations: () => Promise<Reservation[]>
  createReservation: (productId: number, quantity: number) => Promise<void>
  toPendingReservation: (reservationId: number) => Promise<void>
  toConfirmReservation: (reservationId: number) => Promise<void>
  cancelReservation: (reservationId: number) => Promise<void>
}

export interface SalesStatistics {
  productId: number
  productName: string
  productType: string
  year: number
  month: number
  receivedQuantity: number
  soldQuantity: number
  unitType: string
  totalRevenue: number
}

export interface StatisticsContextType {
  salesStatistics: SalesStatistics[]
  isLoading: boolean
  error: string | null
  fetchSalesStatistics: (year?: number, month?: number) => Promise<void>
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
