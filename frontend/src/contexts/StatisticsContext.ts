import { createContext } from 'react'
import { StatisticsContextType } from '../types'

export const StatisticsContext = createContext<
  StatisticsContextType | undefined
>(undefined)
