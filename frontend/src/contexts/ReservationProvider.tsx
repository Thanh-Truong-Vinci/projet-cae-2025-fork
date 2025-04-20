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

  const clearReservation = async (reservationId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          'Vous devez être authentifié pour vider une réservation'
        )
      }

      const response = await axios.post(
        `/api/reservation/clear`,
        reservationId,
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Réservation vidée avec succès')
        // Refresh reservations
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors du vidage de la réservation: ${response.status}`
        )
      }
    } catch (err) {
      console.error('Erreur lors du vidage de la réservation:', err)
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors du vidage de la réservation'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors du vidage de la réservation')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const changeReservationLineQuantity = async (
    lineId: number,
    quantity: number
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error(
          "Vous devez être authentifié pour modifier la quantité d'une ligne de réservation"
        )
      }

      const response = await axios.post(
        `/api/reservation/changeQuantity`,
        { reservationLineId: lineId, quantity },
        {
          headers: {
            Authorization: authenticatedUser.token,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status >= 200 && response.status < 300) {
        console.log('Quantité de la ligne mise à jour avec succès')
        // Refresh reservations
        await fetchReservations()
      } else {
        throw new Error(
          `Erreur lors de la mise à jour de la quantité de la ligne: ${response.status}`
        )
      }
    } catch (err) {
      console.error(
        'Erreur lors de la mise à jour de la quantité de la ligne:',
        err
      )
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            'Erreur lors de la mise à jour de la quantité de la ligne'
        )
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(
          'Erreur inconnue lors de la mise à jour de la quantité de la ligne'
        )
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
        clearReservation,
        changeReservationLineQuantity,
      }}
    >
      {children}
    </ReservationContext.Provider>
  )
}
