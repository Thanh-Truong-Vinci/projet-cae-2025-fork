import { createContext } from 'react'

// 1. Définitions des types et constantes
export interface Product {
  id: number
  name: string
  price: string
  image: string
  category?: string
  description?: string
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

// 2. Définition du type de contexte
export interface ProductContextType {
  products: Product[]
  getProductById: (id: number) => Product | undefined
  getProductsByCategory: (category: string) => Product[]
  getCategoryLabel: (category: string) => string
  isLoading: boolean
  error: string | null
}

// 3. Création du contexte
export const ProductContext = createContext<ProductContextType>({
  products: [],
  getProductById: () => undefined,
  getProductsByCategory: () => [],
  getCategoryLabel: (category) => categoryLabels[category] || category,
  isLoading: false,
  error: null,
})
