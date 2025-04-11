import { useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { BatchContext } from './BatchContext'
import { Batch, NewBatch } from '../types'
import { UserContext } from './UserContext'

interface BatchProviderProps {
  children: ReactNode
}

export const BatchProvider = ({ children }: BatchProviderProps) => {
  const [myBatches, setMyBatches] = useState<Batch[]>([])
  const [approvedBatches, setApprovedBatches] = useState<Batch[]>([])
  const [receivedBatches, setReceivedBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatBatch = (rawBatch: any): Batch => {
    console.log('Raw batch data:', rawBatch)

    let producerName = 'Producteur inconnu'
    if (rawBatch.producer) {
      const firstName = rawBatch.producer.firstname || ''
      const lastName = rawBatch.producer.name || ''
      if (firstName || lastName) {
        producerName = `${firstName} ${lastName}`.trim()
      }
    }

    return {
      id: rawBatch.idBatch || rawBatch.id,
      productName: rawBatch.product?.name || 'Produit inconnu',
      productType: rawBatch.product?.type?.title,
      imageUrl:
        rawBatch.photo?.imageLocation || 'https://via.placeholder.com/150',
      availabilityDate: rawBatch.availabilityDate || new Date().toISOString(),
      availableQuantity: rawBatch.availableQuantity || 0,
      unitPrice: rawBatch.unitPrice || 0,
      unitType: rawBatch.saleUnit || 'unité',
      producerId: rawBatch.producer?.id || 0,
      producerName: producerName,
      createdAt: rawBatch.productionDate || new Date().toISOString(),
      status: rawBatch.status || 'APPROVED',
    }
  }

  const fetchMyBatches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour accéder à vos lots')
      }

      // Utilisation de fetch avec méthode GET
      const response = await fetch('/api/batches/mybatches', {
        method: 'GET',
        headers: {
          Authorization: authenticatedUser.token,
          'Content-Type': 'application/json',
        },
      })

      // Vérification de la réponse
      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Réponse API batches:', data)

      // Formater les données reçues avant de les stocker dans l'état
      const formattedBatches = Array.isArray(data)
        ? data.map((rawBatch) => formatBatch(rawBatch))
        : []

      setMyBatches(formattedBatches)
    } catch (err) {
      console.error('Erreur lors de la récupération des lots:', err)
      if (err instanceof Error) {
        setError(`Impossible de charger vos lots: ${err.message}`)
      } else {
        setError('Impossible de charger vos lots')
      }
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedUser])

  const fetchApprovedBatches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/batches/approved')

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      // Format the data before setting state
      const formattedBatches = Array.isArray(data)
        ? data.map((rawBatch) => formatBatch(rawBatch))
        : []
      setApprovedBatches(formattedBatches)
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
      console.error('Erreur lors de la récupération des lots approuvés:', error)
    } finally {
      setIsLoading(false)
    }
  }, []) // No dependencies needed since formatBatch doesn't depend on any props or state

  const fetchReceivedBatches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/batches/received')

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      // Format the data before setting state
      const formattedBatches = Array.isArray(data)
        ? data.map((rawBatch) => formatBatch(rawBatch))
        : []
      setReceivedBatches(formattedBatches)
      return formattedBatches
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      )
      console.error('Erreur lors de la récupération des lots reçus:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, []) // No dependencies needed since formatBatch doesn't depend on any props or state

  const receiveBatch = async (batchId: number): Promise<Batch | null> => {
    if (!authenticatedUser) return null

    try {
      console.log('Auth token for receive:', authenticatedUser.token)

      const response = await axios.patch(
        `/api/batches/${batchId}/receive`,
        {},
        {
          headers: {
            Authorization: authenticatedUser.token,
          },
        }
      )

      // Update the local state by removing the received batch
      setApprovedBatches((prevBatches) =>
        prevBatches.filter((batch) => batch.id !== batchId)
      )

      return response.data ? formatBatch(response.data) : null
    } catch (err) {
      console.error('Error receiving batch:', err)
      if (axios.isAxiosError(err)) {
        console.error('Response error:', err.response?.data)
        throw new Error(
          `${err.response?.data?.message || 'Failed to receive batch'}`
        )
      } else {
        throw new Error('Failed to receive batch')
      }
    }
  }

  const createBatch = async (
    newBatch: NewBatch,
    image: File
  ): Promise<void> => {
    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour ajouter un lot')
      }

      console.log(
        'Création de lot:',
        newBatch.productName,
        'avec image:',
        image.name
      )

      console.log('Image à envoyer:', {
        nom: image.name,
        type: image.type,
        taille: `${(image.size / 1024).toFixed(2)}KB`,
      })

      const formData = new FormData()

      // Ajouter l'image directement (sans transformation JSON qui cause l'erreur 413)
      formData.append('image', image)

      // Ajouter les données du lot en JSON
      formData.append(
        'batch',
        new Blob([JSON.stringify(newBatch)], {
          type: 'application/json',
        })
      )

      const options = {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: authenticatedUser.token,
        },
      }

      const response = await fetch('/api/batches/createbatch', options)
      console.log('Statut de la réponse:', response.status)

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`
        )

      const createdBatch = await response.json()
      console.log('Lot créé avec succès:', createdBatch)

      return createdBatch
    } catch (err) {
      console.error('addBatch::error: ', err)
      if (err instanceof Error) {
        throw new Error(err.message || 'Erreur lors de la création du lot')
      }
      throw new Error('Erreur inconnue lors de la création du lot')
    }
  }

  useEffect(() => {
    if (authenticatedUser?.role === 'Volunteer') {
      fetchApprovedBatches()
    }
  }, [authenticatedUser, fetchApprovedBatches])

  return (
    <BatchContext.Provider
      value={{
        myBatches,
        approvedBatches,
        receivedBatches,
        isLoading,
        error,
        fetchApprovedBatches,
        fetchMyBatches,
        fetchReceivedBatches,
        receiveBatch,
        createBatch,
      }}
    >
      {children}
    </BatchContext.Provider>
  )
}
