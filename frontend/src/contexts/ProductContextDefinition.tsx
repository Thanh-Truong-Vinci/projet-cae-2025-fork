import { createContext, useState, useEffect } from 'react'

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
export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
)

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()

      // Vérification et transformation des données
      const validatedProducts: Product[] = Array.isArray(data)
        ? data.map((item) => ({
            id: Number(item.id || 0),
            name: String(item.name || ''),
            price: String(item.price || '0'),
            image: String(item.image || 'https://via.placeholder.com/150'),
            category: item.category ? String(item.category) : undefined,
            description: item.description
              ? String(item.description)
              : undefined,
          }))
        : []

      setProducts(validatedProducts)
    } catch (err) {
      // Gestion typée des erreurs
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur inconnue est survenue')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const getProductById = (id: number) =>
    products.find((product) => product.id === id)
  const getProductsByCategory = (category: string) =>
    products.filter((product) => product.category === category)
  const getCategoryLabel = (category: string) =>
    categoryLabels[category] || 'Inconnu'

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
