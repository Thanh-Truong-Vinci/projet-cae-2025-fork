import { useState, useEffect, useContext, ReactNode, useCallback } from 'react'
import { PhotoContext } from './PhotoContext'
import { Photo } from '../types'
import { UserContext } from './UserContext'

interface PhotoProviderProps {
  children: ReactNode
}

export const PhotoProvider = ({ children }: PhotoProviderProps) => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  const fetchAllPhotos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/photos', {
        headers: authenticatedUser?.token 
          ? { Authorization: authenticatedUser.token }
          : {}
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Photos API response:', data)

      // Format the data to ensure it matches the Photo interface
      const formattedPhotos = Array.isArray(data)
        ? data.map((photo) => ({
            id: photo.id || photo.idPhoto,
            imageLocation: photo.imageLocation || photo.imageUrl || ''
          }))
        : []

      setPhotos(formattedPhotos)
    } catch (err) {
      console.error('Error fetching photos:', err)
      if (err instanceof Error) {
        setError(`Impossible de charger les photos: ${err.message}`)
      } else {
        setError('Impossible de charger les photos')
      }
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedUser])

  // Load photos when the component mounts
  useEffect(() => {
    fetchAllPhotos()
  }, [fetchAllPhotos])

  return (
    <PhotoContext.Provider
      value={{
        photos,
        isLoading,
        error,
        fetchAllPhotos,
      }}
    >
      {children}
    </PhotoContext.Provider>
  )
}
