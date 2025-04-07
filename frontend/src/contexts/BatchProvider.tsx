import { useState, useEffect, useContext, ReactNode } from 'react'
import axios from 'axios'
import { BatchContext } from './BatchContext'
import { Batch, NewBatch } from '../types'
import { UserContext } from './UserContext'

interface BatchProviderProps {
  children: ReactNode
}

export const BatchProvider = ({ children }: BatchProviderProps) => {
  const [approvedBatches, setApprovedBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  // Transform raw backend batch data to match the frontend Batch interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatBatch = (rawBatch: any): Batch => {
    console.log('Raw batch data:', rawBatch)
    return {
      id: rawBatch.idBatch || rawBatch.id,
      productName: rawBatch.product?.name || 'Produit inconnu',
      productType:
        rawBatch.product?.type?.title
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_') || 'autres',
      imageUrl: rawBatch.photo || 'https://via.placeholder.com/150',
      availabilityDate: rawBatch.availabilityDate || new Date().toISOString(),
      availableQuantity: rawBatch.availableQuantity || 0,
      unitPrice: rawBatch.unitPrice || 0,
      unitType: rawBatch.saleUnit || 'unité',
      producerId: rawBatch.producer?.idUser || 0,
      producerName:
        rawBatch.producer?.user?.firstname +
          ' ' +
          rawBatch.producer?.user?.name || 'Producteur inconnu',
      createdAt: rawBatch.depositDate || new Date().toISOString(),
      status: rawBatch.status || 'APPROVED',
    }
  }

  const fetchApprovedBatches = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/batches/approved')

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setApprovedBatches(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
      console.error('Erreur lors de la récupération des lots approuvés:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const createBatch = async (newBatch: NewBatch, image: File): Promise<void> => {
    try {
      if (!authenticatedUser) {
        throw new Error("Vous devez être authentifié pour ajouter un lot")
      }

      // Préparation du FormData pour l'envoi multipart
      const formData = new FormData()

      // Ajouter les données JSON sous forme de chaîne, mais avec le bon nom de fichier et type MIME
      const batchBlob = new Blob([JSON.stringify(newBatch)], {
        type: 'application/json'
      });
      formData.append('batch', batchBlob, 'batch.json');  // Ajout du nom de fichier

      // Ajouter l'image
      formData.append('image', image)

      console.log('Envoi batch:', newBatch);
      console.log('Envoi image:', image.name, image.type, image.size);

      // Envoi de la requête avec Axios
      const response = await axios.post('/api/batches/createbatch', formData, {
        headers: {
          Authorization: authenticatedUser.token,
          // Ne pas définir Content-Type, Axios le fera automatiquement avec la boundary pour multipart/form-data
        }
      })

      return response.data;
    } catch (err) {
      console.error('addBatch::error: ', err)
      if (axios.isAxiosError(err)) {
        console.error('Response data:', err.response?.data)
        throw new Error(err.response?.data?.message || `Erreur: ${err.response?.status}`)
      }
      throw err
    }
  }

  useEffect(() => {
    if (authenticatedUser?.role === 'Volunteer') {
      fetchApprovedBatches()
    }
  }, [authenticatedUser])

  return (
    <BatchContext.Provider
      value={{
        approvedBatches,
        isLoading,
        error,
        fetchApprovedBatches,
        receiveBatch,
        createBatch
      }}
    >
      {children}
    </BatchContext.Provider>
  )
}
