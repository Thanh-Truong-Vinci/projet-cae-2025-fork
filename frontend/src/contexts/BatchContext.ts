import { createContext } from 'react'
import { BatchContextType } from '../types'

export const BatchContext = createContext<BatchContextType | undefined>(
  undefined
)
