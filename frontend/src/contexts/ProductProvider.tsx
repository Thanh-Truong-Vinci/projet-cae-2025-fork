import { useState, useEffect, ReactNode, useCallback } from 'react'
import { ProductContext } from './ProductContext'
import { Product } from '../types'
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

  // Version simplifiée sans dépendance à categoryLabels
  const getCategoryLabel = useCallback(
    (category: string) => {
      // Vérifier si un produit avec cette catégorie existe et a un type
      const matchingProduct = products.find(
        (product) =>
          normalizeString(product.category) === normalizeString(category)
      )

      // Si on trouve un produit correspondant avec un type, utiliser son titre
      if (matchingProduct?.productType?.title) {
        return matchingProduct.productType.title
      }

      // Sinon retourner la catégorie telle quelle (avec première lettre majuscule)
      return category.charAt(0).toUpperCase() + category.slice(1)
    },
    [products]
  )

  // Fonction utilitaire pour normaliser les chaînes (pour comparaison)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

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
