import { useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { BatchContext } from './BatchContext'
import { Batch, PendingBatch, NewBatch } from '../types'
import { UserContext } from './UserContext'

interface BatchProviderProps {
  children: ReactNode
}

export const BatchProvider = ({ children }: BatchProviderProps) => {
  const [myBatches, setMyBatches] = useState<Batch[]>([])
  const [pendingBatches, setPendingBatches] = useState<PendingBatch[]>([])
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

  const fetchPendingBatches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour accéder à vos lots')
      }

      // Utilisation de fetch avec méthode GET
      const response = await fetch('/api/batches/pending', {
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

      setPendingBatches(data)
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
      setReceivedBatches(data)
      return data
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

      const formData = new FormData()

      // Important: Add batch data first
      formData.append(
        'batch',
        new Blob([JSON.stringify(newBatch)], {
          type: 'application/json',
        })
      )

      // Then add the image (order matters in some server implementations)
      formData.append('image', image)

      // DON'T set Content-Type header - let browser set it with boundary
      const options = {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: authenticatedUser.token,
        },
      }

      const response = await fetch('/api/batches/createbatch', options)

      if (!response.ok)
        throw new Error(
          `fetch error : ${response.status} : ${response.statusText}`
        )

      const createdBatch = await response.json()
      console.log('Lot créé avec succès:', createdBatch)

      return createdBatch
    } catch (err) {
      console.error('addBatch::error: ', err)
      throw err instanceof Error
        ? new Error(err.message || 'Erreur lors de la création du lot')
        : new Error('Erreur inconnue lors de la création du lot')
    }
  }

  const updateBatchImage = async (
    batchId: number,
    image: File
  ): Promise<Batch | null> => {
    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour modifier une image')
      }

      console.log(
        `Updating batch ${batchId} with image: ${image.name} (${image.size} bytes)`
      )

      const formData = new FormData()
      formData.append('image', image)

      // Use axios instead of fetch for better multipart form handling
      const response = await axios.patch(
        `/api/batches/${batchId}/updateImage`,
        formData,
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('Image update response:', response.data)

      if (response.status >= 200 && response.status < 300) {
        const updatedBatch = response.data
        console.log('Image du lot mise à jour avec succès:', updatedBatch)

        // Update the batch in the local state
        setMyBatches((prevBatches) =>
          prevBatches.map((batch) =>
            batch.id === batchId ? formatBatch(updatedBatch) : batch
          )
        )

        return formatBatch(updatedBatch)
      } else {
        throw new Error(`Error status: ${response.status}`)
      }
    } catch (err) {
      console.error('updateBatchImage::error: ', err)
      if (axios.isAxiosError(err)) {
        console.error('Response data:', err.response?.data)
        console.error('Response status:', err.response?.status)
        throw new Error(
          err.response?.data?.message ||
            "Erreur lors de la mise à jour de l'image"
        )
      } else if (err instanceof Error) {
        throw new Error(
          err.message || "Erreur lors de la mise à jour de l'image"
        )
      }
      throw new Error("Erreur inconnue lors de la mise à jour de l'image")
    }
  }

  const updateBatchImageById = async (
    batchId: number,
    imageId: number
  ): Promise<Batch | null> => {
    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour modifier une image')
      }

      console.log(
        `Updating batch ${batchId} with existing image id: ${imageId}`
      )

      // Usa axios per coerenza con updateBatchImage e per une meilleure gestion des erreurs
      const response = await axios.patch(
        `/api/batches/${batchId}/updateImageById`,
        { imageId },
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Image update by ID response:', response.data)

      if (response.status >= 200 && response.status < 300) {
        const updatedBatch = response.data
        console.log(
          'Image du lot mise à jour avec succès par ID:',
          updatedBatch
        )

        // Update the batch in the local state
        setMyBatches((prevBatches) =>
          prevBatches.map((batch) =>
            batch.id === batchId ? formatBatch(updatedBatch) : batch
          )
        )

        return formatBatch(updatedBatch)
      } else {
        throw new Error(`Error status: ${response.status}`)
      }
    } catch (err) {
      console.error('updateBatchImageById::error: ', err)
      if (axios.isAxiosError(err)) {
        console.error('Response data:', err.response?.data)
        console.error('Response status:', err.response?.status)
        throw new Error(
          err.response?.data?.message ||
            "Erreur lors de la mise à jour de l'image par ID"
        )
      } else if (err instanceof Error) {
        throw new Error(
          err.message || "Erreur lors de la mise à jour de l'image par ID"
        )
      }
      throw new Error(
        "Erreur inconnue lors de la mise à jour de l'image par ID"
      )
    }
  }

  const acceptBatch = useCallback(
    async (batchId: number): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        if (!authenticatedUser) {
          throw new Error('Vous devez être authentifié pour accepter un lot')
        }

        const response = await fetch(`/api/batches/${batchId}/accept`, {
          method: 'PATCH',
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        // Recharger les lots pour mettre à jour l'interface
        await fetchPendingBatches()
      } catch (err) {
        console.error("Erreur lors de l'acceptation du lot:", err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [authenticatedUser, fetchPendingBatches]
  )

  const rejectBatch = useCallback(
    async (batchId: number, rejectionReason: string): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        if (!authenticatedUser) {
          throw new Error('Vous devez être authentifié pour rejeter un lot')
        }

        const response = await fetch(
          `/api/batches/${batchId}/reject?message=${encodeURIComponent(rejectionReason)}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: authenticatedUser.token,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        // Recharger les lots pour mettre à jour l'interface
        await fetchPendingBatches()
      } catch (err) {
        console.error('Erreur lors du rejet du lot:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [authenticatedUser, fetchPendingBatches]
  )

  useEffect(() => {
    if (authenticatedUser?.role === 'Volunteer') {
      fetchApprovedBatches()
    }
  }, [authenticatedUser, fetchApprovedBatches])

  return (
    <BatchContext.Provider
      value={{
        myBatches,
        pendingBatches,
        approvedBatches,
        receivedBatches,
        isLoading,
        error,
        fetchPendingBatches,
        fetchApprovedBatches,
        fetchMyBatches,
        fetchReceivedBatches,
        receiveBatch,
        createBatch,
        updateBatchImage,
        updateBatchImageById,
        acceptBatch,
        rejectBatch,
      }}
    >
      {children}
    </BatchContext.Provider>
  )
}
