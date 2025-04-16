import { useState, useEffect, ReactNode, useCallback } from 'react'
import { ProductContext } from './ProductContext'
import { ProductBatch, Product } from '../types'

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductBatch[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadingAllProducts, setLoadingAllProducts] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
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

  const fetchAllProducts = useCallback(async () => {
    try {
      setLoadingAllProducts(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedProducts = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        productType: item.type,
        image: item.photo?.imageLocation || '',
        type: item.type,
        photo: item.photo,
      }))

      setAllProducts(mappedProducts)
      return mappedProducts
    } catch (error) {
      console.error('Error fetching all products:', error)
      setError('Failed to load all products')
      return []
    } finally {
      setLoadingAllProducts(false)
    }
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
    (category: string) => {
      // Vérifier si un produit avec cette catégorie existe et a un type
      const matchingProduct = products.find(
        (product) =>
          normalizeString(product.productType) === normalizeString(category)
      )

      // Si on trouve un produit correspondant avec un type, utiliser son titre
      if (matchingProduct?.productType) {
        return matchingProduct.productType
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
        allProducts,
        loadingAllProducts,
        isLoading,
        error,
        getProductById,
        getProductsByCategory,
        getCategoryLabel,
        fetchAllProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}
