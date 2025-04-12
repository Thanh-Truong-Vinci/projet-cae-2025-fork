import { useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import axios from 'axios'
import { ReservationContext } from './ReservationContext'
import { UserContext } from './UserContext'
import { Reservation, ReservationRequest } from '../types'

interface ReservationProviderProps {
  children: ReactNode
}

export const ReservationProvider = ({ children }: ReservationProviderProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  // Fetch all reservations for the current user
  const fetchReservations = useCallback(async (): Promise<Reservation[]> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour accéder à vos réservations')
      }

      const response = await fetch('/reservation/list', {
        method: 'GET',
        headers: {
          Authorization: authenticatedUser.token,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Réservations récupérées:', data)
      
      // Format dates and ensure consistency
      const formattedReservations = Array.isArray(data)
        ? data.map((reservation: any) => ({
            ...reservation,
            reservationDate: reservation.reservationDate || new Date().toISOString(),
            saleDate: reservation.saleDate || null,
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

  // Create a new reservation
  const createReservation = async (productId: number, quantity: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour créer une réservation')
      }

      const reservationRequest: ReservationRequest = {
        productId,
        quantity,
      }

      const response = await axios.post('/reservation/reserve', reservationRequest, {
        headers: {
          Authorization: authenticatedUser.token,
          'Content-Type': 'application/json',
        },
      })

      if (response.status >= 200 && response.status < 300) {
        console.log('Réservation créée avec succès')
        // Refresh the reservations list
        await fetchReservations()
      } else {
        throw new Error(`Erreur lors de la création de la réservation: ${response.status}`)
      }
    } catch (err) {
      console.error('Erreur lors de la création de la réservation:', err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erreur lors de la création de la réservation')
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

  // Cancel a reservation
  const cancelReservation = async (reservationId: number): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      if (!authenticatedUser) {
        throw new Error('Vous devez être authentifié pour annuler une réservation')
      }

      const response = await axios.post(
        '/reservation/cancel',
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
        
        // Update the local state by removing the canceled reservation
        setReservations((prevReservations) =>
          prevReservations.filter((reservation) => reservation.id !== reservationId)
        )
      } else {
        throw new Error(`Erreur lors de l'annulation de la réservation: ${response.status}`)
      }
    } catch (err) {
      console.error('Erreur lors de l\'annulation de la réservation:', err)
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Erreur lors de l\'annulation de la réservation')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erreur inconnue lors de l\'annulation de la réservation')
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
        createReservation,
        cancelReservation,
      }}
    >
      {children}
    </ReservationContext.Provider>
  )
}
