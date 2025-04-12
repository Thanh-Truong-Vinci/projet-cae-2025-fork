import { useState, useEffect, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { ProductContext } from './ProductContext'
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

        const formattedProducts = response.data.map(
          (item: {
            id: number
            name: string
            photo?: {
              id: number
              productName: string
              imageLocation: string
            }
            type?: { title: string; id: number }
            description?: string
          }) => ({
            id: item.id,
            name: item.name,
            price: '10.00€',
            image:
              item.photo?.imageLocation || 'https://via.placeholder.com/150',
            // Ne pas transformer la catégorie
            category: item.type?.title || 'Autres',
            description: item.description || '',
            // Stocker également le productType pour le filtrage
            productType: item.type
              ? {
                  id: item.type.id,
                  title: item.type.title,
                }
              : undefined,
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
