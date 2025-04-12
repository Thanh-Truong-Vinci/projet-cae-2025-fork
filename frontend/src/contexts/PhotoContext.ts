import { createContext } from 'react'
import { PhotoContextType } from '../types'

export const PhotoContext = createContext<PhotoContextType | undefined>(
  undefined
)
