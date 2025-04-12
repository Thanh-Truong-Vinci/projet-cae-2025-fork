import React, {
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from 'react'
import { ProductType } from '../types'
import { UserContext } from './UserContext'
import {
  ProductTypeContext,
  ProductTypeContextType,
} from './ProductTypeContext'

interface ProductTypeProviderProps {
  children: ReactNode
}

export const ProductTypeProvider: React.FC<ProductTypeProviderProps> = ({
  children,
}) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatProductType = (rawProductType: any): ProductType => {
    return {
      id: rawProductType.id,
      title: rawProductType.title || 'Sans titre',
    }
  }

  // Fonction pour récupérer tous les types de produits
  const fetchProductTypes = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/product-types')

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Réponse API product-types:', data)

      const formattedTypes = Array.isArray(data)
        ? data.map((rawType) => formatProductType(rawType))
        : []

      setProductTypes(formattedTypes)
    } catch (err) {
      console.error('Erreur lors du chargement des types de produits:', err)
      if (err instanceof Error) {
        setError(`Impossible de charger les types de produits: ${err.message}`)
      } else {
        setError('Impossible de charger les types de produits')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour ajouter un type de produit
  const addProductType = async (title: string): Promise<boolean> => {
    if (!title.trim()) {
      setError('Le nom du type ne peut pas être vide')
      return false
    }

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour ajouter un type de produit'
        )
      }

      const response = await fetch('/api/product-types/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authenticatedUser.token,
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erreur de réponse:', response.status, errorData)
        throw new Error(`Erreur: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Type de produit créé avec succès:', data)

      await fetchProductTypes()
      return true
    } catch (err) {
      console.error("Erreur lors de l'ajout du type:", err)

      if (err instanceof Error) {
        setError(`Impossible d'ajouter le type de produit: ${err.message}`)
      } else {
        setError("Impossible d'ajouter le type de produit")
      }

      return false
    }
  }

  // Fonction pour supprimer un type de produit
  const deleteProductType = async (
    id: number
  ): Promise<{ success: boolean; constraintViolation?: boolean }> => {
    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour supprimer un type de produit'
        )
      }

      console.log(`Tentative de suppression du type de produit avec ID: ${id}`)

      const response = await fetch(`/api/product-types/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: authenticatedUser.token,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erreur de réponse:', response.status, errorData)

        if (
          response.status === 500 &&
          errorData.includes('foreign key constraint') &&
          errorData.includes('products')
        ) {
          setError(null)
          return { success: false, constraintViolation: true }
        }

        throw new Error(`Erreur: ${response.status} ${response.statusText}`)
      }

      console.log('Type de produit supprimé avec succès:', id)
      setProductTypes((prevTypes) => prevTypes.filter((type) => type.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Erreur lors de la suppression du type:', err)

      if (err instanceof Error) {
        setError(`Impossible de supprimer le type de produit: ${err.message}`)
      } else {
        setError('Impossible de supprimer le type de produit')
      }

      return { success: false }
    }
  }

  // Charger les types de produits au montage du composant
  useEffect(() => {
    fetchProductTypes()
  }, [fetchProductTypes])

  const value: ProductTypeContextType = {
    productTypes,
    loading,
    error,
    fetchProductTypes,
    addProductType,
    deleteProductType,
  }

  return (
    <ProductTypeContext.Provider value={value}>
      {children}
    </ProductTypeContext.Provider>
  )
}
