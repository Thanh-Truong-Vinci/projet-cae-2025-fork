import { useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { ReservationContext } from './ReservationContext'
import { UserContext } from './UserContext'
import { ReservationRequest, ReservationView } from '../types'

interface ReservationProviderProps {
  children: ReactNode
}

export const ReservationProvider = ({ children }: ReservationProviderProps) => {
  const [reservations, setReservations] = useState<ReservationView[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  // Fetch all reservations for the current user
  const fetchReservations = useCallback(async (): Promise<
    ReservationView[]
  > => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour accéder à vos réservations'
        )
      }

      const response = await axios.get('/api/reservation/list', {
        headers: {
          Authorization: authenticatedUser.token,
          'Content-Type': 'application/json',
        },
      })

      const data = response.data
      console.log('Réservations récupérées:', data)

      // Format dates and ensure consistency
      const formattedReservations = Array.isArray(data)
        ? data.map((reservation: ReservationView) => ({
            ...reservation,
            reservationDate:
              reservation.reservationDate || new Date().toISOString(),
            saleDate: reservation.saleDate || undefined,
            reservationLines: Array.isArray(reservation.reservationLines)
              ? reservation.reservationLines
              : [],
          }))
        : []

      setReservations(formattedReservations)
      return formattedReservations
    } catch (err) {
      console.error('Erreur lors de la récupération des réservations:', err)
      if (err instanceof Error) {
        setError(`Impossible de charger vos réservations: ${err.message}`)
      } else {
        setError('Impossible de charger vos réservations')
      }
      return []
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedUser])

  // Fetch all reservations regardless of the client
  const fetchAllReservations = useCallback(async (): Promise<
    ReservationView[]
  > => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/reservation/all', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = response.data
      console.log('Toutes les réservations récupérées:', data)

      const formattedReservations = Array.isArray(data)
        ? data.map((reservation: ReservationView) => ({
            ...reservation,
            reservationDate:
              reservation.reservationDate || new Date().toISOString(),
            saleDate: reservation.saleDate || undefined,
            reservationLines: Array.isArray(reservation.reservationLines)
              ? reservation.reservationLines
              : [],
          }))
        : []

      setReservations(formattedReservations)
      return formattedReservations
    } catch (err) {
      console.error(
        'Erreur lors de la récupération de toutes les réservations:',
        err
      )
      if (err instanceof Error) {
        setError(`Impossible de charger les réservations: ${err.message}`)
      } else {
        setError('Impossible de charger les réservations')
      }
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new reservation
  const createReservation = async (
    productId: number,
    quantity: number
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour créer une réservation'
        )
      }

      const reservationRequest: ReservationRequest = {
        productId,
        quantity,
      }

      const response = await axios.post(
        '/api/reservation/reserve',
        reservationRequest,
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Réservation créée avec succès')
        // Refresh the reservations list
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors de la création de la réservation: ${response.status}`
        )
      }
    } catch (err) {
      console.error('Erreur lors de la création de la réservation:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la création de la réservation'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors de la création de la réservation')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Set a reservation to PENDING status
  const toPendingReservation = async (reservationId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour modifier une réservation'
        )
      }

      const response = await axios.post(
        '/api/reservation/toPending',
        reservationId,
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Réservation mise en attente avec succès')
        // Update local state or refetch
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors du changement de statut de la réservation: ${response.status}`
        )
      }
    } catch (err) {
      console.error('Erreur lors de la mise en attente de la réservation:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la mise en attente de la réservation'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors de la mise en attente de la réservation')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Set a reservation to CONFIRMED status
  const toConfirmReservation = async (reservationId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        '/api/reservation/toConfirm',
        reservationId,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Réservation confirmée avec succès')
        // Update local state if needed
        if (authenticatedUser) {
          await fetchReservations()
        }
      } else {
        throw new Error(
          `Erreur lors de la confirmation de la réservation: ${response.status}`
        )
      }
    } catch (err) {
      console.error('Erreur lors de la confirmation de la réservation:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la confirmation de la réservation'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors de la confirmation de la réservation')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const cancelReservation = async (reservationId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour annuler une réservation'
        )
      }

      const response = await axios.post(
        '/api/reservation/toCancel',
        reservationId,
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Réservation annulée avec succès')

        // Update the local state by fetching the updated list
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors de l'annulation de la réservation: ${response.status}`
        )
      }
    } catch (err) {
      console.error("Erreur lors de l'annulation de la réservation:", err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Erreur lors de l'annulation de la réservation"
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Erreur inconnue lors de l'annulation de la réservation")
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateReservationLineQuantity = async (
    lineId: number,
    quantity: number
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour modifier une réservation'
        )
      }

      const response = await axios.put(
        `/api/reservation/line/${lineId}/quantity`,
        { quantity },
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Quantité mise à jour avec succès')
        // Refresh reservations
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors de la mise à jour de la quantité: ${response.status}`
        )
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la quantité:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la mise à jour de la quantité'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors de la mise à jour de la quantité')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearReservation = async (reservationId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour vider votre panier')
      }

      const response = await axios.delete(
        `/api/reservation/${reservationId}/clear`,
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Panier vidé avec succès')
        // Refresh reservations
        await fetchReservations()
      } else {
        throw new Error(`Erreur lors du vidage du panier: ${response.status}`)
      }
    } catch (err) {
      console.error('Erreur lors du vidage du panier:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || 'Erreur lors du vidage du panier'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors du vidage du panier')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeReservationLine = async (lineId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour supprimer un produit du panier'
        )
      }

      const id = parseInt(String(lineId), 10)

      // Utiliser l'endpoint de quantité existant avec une quantité de 0
      const response = await axios.put(
        `/api/reservation/line/${id}/quantity`,
        { quantity: 0 },
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Produit supprimé du panier avec succès')
        // Refresh reservations
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors de la suppression du produit: ${response.status}`
        )
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la suppression du produit'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors de la suppression du produit')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Load the user's reservations when the component mounts and the user is authenticated
  useEffect(() => {
    if (authenticatedUser && authenticatedUser.role === 'Client') {
      fetchReservations()
    }
  }, [authenticatedUser, fetchReservations])

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        isLoading,
        error,
        fetchReservations,
        fetchAllReservations,
        createReservation,
        toPendingReservation,
        toConfirmReservation,
        cancelReservation,
        updateReservationLineQuantity,
        clearReservation,
        removeReservationLine,
      }}
    >
      {children}
    </ReservationContext.Provider>
  )
}
