import { useState, useEffect, ReactNode, useCallback } from 'react'
import { ProductContext } from './ProductContext'
import { ProductBatch, categoryLabels } from '../types'

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductBatch[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        // Use the updated endpoint path that matches your backend
        const response = await fetch('/api/batches/received/available-view')

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Données reçues du backend:', data)

        setProducts(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to load products')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const getProductById = useCallback(
    (id: number) => products.find((product) => product.productId === id),
    [products]
  )

  const getProductsByCategory = useCallback(
    (category: string) =>
      products.filter((product) => product.productType === category),
    [products]
  )

  const getCategoryLabel = useCallback(
    (category: string) =>
      categoryLabels[category as keyof typeof categoryLabels] || category,
    []
  )

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        error,
        getProductById,
        getProductsByCategory,
        getCategoryLabel,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}
