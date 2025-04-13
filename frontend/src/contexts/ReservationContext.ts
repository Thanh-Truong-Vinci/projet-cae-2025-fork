import { createContext } from 'react'
import { ReservationContextType } from '../types'

export const ReservationContext = createContext<
  ReservationContextType | undefined
>(undefined)
