import { useState, ReactNode, useCallback, useMemo, useEffect } from 'react'
import {
  ProductContext,
  Product,
  categoryLabels,
} from './ProductContextDefinition'
// import axios from 'axios'

/* Interface pour typer la réponse de l'API
interface ApiProduct {
  id_product: number
  name: string
  batchs?: Array<{ prix_unitaire: number }>
  photo?: { url: string }
  id_product_type?: { title: string }
  description?: string
}*/

// IMPORTANT: Uniquement le Provider est exporté par ce fichier
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error] = useState<string | null>(null)

  // Données de secours en cas d'erreur API
  const mockProducts = useMemo<Product[]>(
    () => [
      {
        id: 1,
        name: 'Tomates Bio',
        price: '3.50€',
        image: 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469',
        category: 'legumes',
        description:
          'Tomates cultivées sans pesticides, parfaites pour vos salades estivales.',
      },
      {
        id: 2,
        name: 'Pommes Royal Gala',
        price: '2.75€',
        image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a',
        category: 'fruits',
        description: 'Pommes sucrées et croquantes, idéales comme collation.',
      },
      {
        id: 3,
        name: 'Pain au levain',
        price: '4.20€',
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73',
        category: 'boulangerie',
        description:
          "Pain artisanal à l'ancienne préparé avec du levain naturel.",
      },
      {
        id: 4,
        name: 'Fromage fermier',
        price: '7.50€',
        image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862',
        category: 'produits_laitiers',
        description: 'Fromage à pâte dure affiné pendant 6 mois.',
      },
    ],
    []
  )

  // Commentez le code existant et remplacez-le par une version simplifiée
  useEffect(() => {
    // Utiliser directement les données mockées sans appel API
    setProducts(mockProducts)
    setIsLoading(false)

    // Code commenté à garder pour plus tard quand l'API sera prête
    /*
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get<ApiProduct[]>('/api/products')
        
        // Transformer les données de l'API...
        const formattedProducts = response.data.map(...);
        
        setProducts(formattedProducts)
      } catch (err) {
        console.error('Erreur détaillée:', err)
        setError('Impossible de charger les produits')
        setProducts(mockProducts)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
    */
  }, [mockProducts])

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
