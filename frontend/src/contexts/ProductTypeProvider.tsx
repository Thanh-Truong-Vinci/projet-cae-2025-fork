import React, { useState, useEffect, useContext, ReactNode } from 'react'
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

  // Fonction pour récupérer tous les types de produits
  const fetchProductTypes = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/product-types')
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setProductTypes(data)
    } catch (error) {
      console.error('Erreur lors du chargement des types de produits:', error)
      setError('Impossible de charger les types de produits')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour ajouter un type de produit
  const addProductType = async (title: string): Promise<boolean> => {
    if (!title.trim()) {
      setError('Le nom du type ne peut pas être vide')
      return false
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (authenticatedUser?.token) {
        headers.Authorization = `Bearer ${authenticatedUser.token}`
      }

      const response = await fetch('/api/product-types/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Erreur de réponse:', response.status, errorText)
        throw new Error(`Erreur: ${response.status}`)
      }

      // Recharger la liste après l'ajout
      await fetchProductTypes()
      return true
    } catch (error) {
      console.error("Erreur lors de l'ajout du type:", error)
      setError("Impossible d'ajouter le type de produit")
      return false
    }
  }

  // Fonction pour supprimer un type de produit
  const deleteProductType = async (id: number): Promise<boolean> => {
    try {
      const headers: Record<string, string> = {}

      if (authenticatedUser?.token) {
        headers.Authorization = `Bearer ${authenticatedUser.token}`
      }

      const response = await fetch(`/api/product-types/${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      setProductTypes(productTypes.filter((type) => type.id !== id))
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du type:', error)
      setError('Impossible de supprimer le type de produit')
      return false
    }
  }

  // Charger les types de produits au montage du composant
  useEffect(() => {
    fetchProductTypes()
  }, [])

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
