import { useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { BatchContext } from './BatchContext'
import { Batch } from '../types'
import { UserContext } from './UserContext'

export const BatchProvider = ({ children }: { children: ReactNode }) => {
  const [approvedBatches, setApprovedBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
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
      initialQuantity: rawBatch.availableQuantity || 0, // Assuming same value if not provided
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

  const fetchApprovedBatches = useCallback(async () => {
    if (!authenticatedUser) return

    try {
      setIsLoading(true)
      console.log('Auth token for fetch:', authenticatedUser.token)
      const response = await axios.get('/api/batches/approved', {
        headers: {
          Authorization: authenticatedUser.token,
        },
      })

      console.log('Approved batches response:', response.data)

      // Transform the raw data to match the expected format
      const formattedBatches = Array.isArray(response.data)
        ? response.data.map(formatBatch)
        : []

      setApprovedBatches(formattedBatches)
      setError(null)
    } catch (err) {
      console.error('Error fetching approved batches:', err)
      if (axios.isAxiosError(err)) {
        console.error('Response error:', err.response?.data)
        setError(
          `Failed to load batches: ${err.response?.status || ''} ${err.message}`
        )
      } else {
        setError('Failed to load approved batches')
      }
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedUser])

  const receiveBatch = async (batchId: number) => {
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

  useEffect(() => {
    if (authenticatedUser?.role === 'Volunteer') {
      fetchApprovedBatches()
    }
  }, [authenticatedUser, fetchApprovedBatches])

  return (
    <BatchContext.Provider
      value={{
        approvedBatches,
        isLoading,
        error,
        fetchApprovedBatches,
        receiveBatch,
      }}
    >
      {children}
    </BatchContext.Provider>
  )
}
