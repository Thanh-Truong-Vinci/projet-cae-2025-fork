import { createContext } from 'react'
import { ReservationView } from '../types'

export interface ReservationContextType {
  reservations: ReservationView[]
  isLoading: boolean
  error: string | null
  fetchReservations: () => Promise<ReservationView[]>
  fetchAllReservations: () => Promise<ReservationView[]>
  createReservation: (productId: number, quantity: number) => Promise<void>
  toPendingReservation: (reservationId: number) => Promise<void>
  toConfirmReservation: (reservationId: number) => Promise<void>
  cancelReservation: (reservationId: number) => Promise<void>
  clearReservation: (reservationId: number) => Promise<ReservationView>
  changeReservationLineQuantity: (
    lineId: number,
    quantity: number
  ) => Promise<void>
}

export const ReservationContext = createContext<ReservationContextType | null>(
  null
)
