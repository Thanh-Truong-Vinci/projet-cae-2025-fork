import { useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { ProductContext } from './ProductContext'
import { categoryLabels } from './categoryLabels'
import { Product } from '../types'

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/products')

        // Log pour déboguer la réponse
        console.log('Réponse API:', response.data)

        const formattedProducts = response.data.map(
          (item: {
            id: number
            name: string
            photo?: { url: string }
            type?: { title: string }
            description?: string
          }) => ({
            id: item.id,
            name: item.name,
            price: '10.00€',
            image: item.photo?.url || 'https://via.placeholder.com/150',
            category:
              item.type?.title
                ?.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
                .replace(/\s+/g, '_') || 'autres',
            description: item.description || '',
          })
        )

        setProducts(formattedProducts)
        setError(null)
      } catch (err) {
        console.error('Erreur détaillée:', err)
        if (axios.isAxiosError(err)) {
          setError(
            `Impossible de charger les produits: ${err.response?.status || ''} ${err.message}`
          )
        } else {
          setError('Impossible de charger les produits')
        }
        // Ne pas utiliser de mockProducts, laisser products comme un tableau vide
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, []) // Supprimer la dépendance mockProducts qui n'existe plus

  const getProductById = useCallback(
    (id: number) => products.find((product) => product.id === id),
    [products]
  )

  const getProductsByCategory = useCallback(
    (category: string) =>
      products.filter((product) => product.category === category),
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
        getProductById,
        getProductsByCategory,
        getCategoryLabel,
        isLoading,
        error,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}
