import { createContext, useContext } from 'react'
import { ProductType } from '../types'

export interface ProductTypeContextType {
  productTypes: ProductType[]
  loading: boolean
  error: string | null
  fetchProductTypes: () => Promise<void>
  addProductType: (title: string) => Promise<boolean>
  deleteProductType: (
    id: number
  ) => Promise<{ success: boolean; constraintViolation?: boolean }>
}

export const ProductTypeContext = createContext<ProductTypeContextType>({
  productTypes: [],
  loading: false,
  error: null,
  fetchProductTypes: async () => {},
  addProductType: async () => false,
  deleteProductType: async () => ({ success: false }),
})

export const useProductType = () => useContext(ProductTypeContext)
