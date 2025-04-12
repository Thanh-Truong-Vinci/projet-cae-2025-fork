import { createContext, useContext } from 'react'
import { ProductType } from '../types'

// Interface définissant toutes les fonctionnalités du contexte
export interface ProductTypeContextType {
  productTypes: ProductType[]
  loading: boolean
  error: string | null
  fetchProductTypes: () => Promise<void>
  addProductType: (title: string) => Promise<boolean>
  deleteProductType: (id: number) => Promise<boolean>
}

// Création du contexte
export const ProductTypeContext = createContext<ProductTypeContextType | null>(
  null
)

// Hook personnalisé pour faciliter l'utilisation du contexte
export const useProductType = (): ProductTypeContextType => {
  const context = useContext(ProductTypeContext)
  if (context === null) {
    throw new Error(
      "useProductType doit être utilisé à l'intérieur d'un ProductTypeProvider"
    )
  }
  return context
}
