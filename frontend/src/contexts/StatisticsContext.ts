import { createContext } from 'react'
import { SalesStatistics } from '../types'

export interface StatisticsContextType {
  salesStatistics: SalesStatistics[]
  isLoading: boolean
  error: string | null
  fetchSalesStatistics: (
    year?: number,
    month?: number,
    productId?: number
  ) => Promise<void>
}

export const StatisticsContext = createContext<
  StatisticsContextType | undefined
>(undefined)
