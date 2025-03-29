import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import axios from 'axios'
import { ProductContext } from './ProductContext'
import { categoryLabels } from './categoryLabels'
import { Product } from '../types'

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
    ],
    []
  )

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/products')

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
              item.type?.title?.toLowerCase().replace(' ', '_') || 'autres',
            description: item.description || '',
          })
        )

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
