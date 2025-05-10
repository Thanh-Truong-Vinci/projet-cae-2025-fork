import React, { useState, useCallback, ReactNode } from 'react'
import { StatisticsContext, StatisticsContextType } from './StatisticsContext'
import { SalesStatistics } from '../types'
import { useContext as useReactContext } from 'react'
import { UserContext } from './UserContext'

interface StatisticsProviderProps {
  children: ReactNode
}

export const StatisticsProvider: React.FC<StatisticsProviderProps> = ({
  children,
}) => {
  const [salesStatistics, setSalesStatistics] = useState<SalesStatistics[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useReactContext(UserContext)!

  const fetchSalesStatistics = useCallback(
    async (year?: number, month?: number, productId?: number) => {
      setIsLoading(true)
      setError(null)

      try {
        // Construisez l'URL avec tous les paramètres
        let url = '/api/statistics/sales'
        const params = new URLSearchParams()

        if (year) params.append('year', year.toString())
        if (month) params.append('month', month.toString())
        if (productId) params.append('productId', productId.toString())

        const queryString = params.toString()
        if (queryString) {
          url += `?${queryString}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: authenticatedUser?.token || '',
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}`)
        }

        const data = await response.json()
        setSalesStatistics(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors de la récupération des statistiques'
        )
        setSalesStatistics([])
      } finally {
        setIsLoading(false)
      }
    },
    [authenticatedUser]
  )

  const contextValue: StatisticsContextType = {
    salesStatistics,
    isLoading,
    error,
    fetchSalesStatistics,
  }

  return (
    <StatisticsContext.Provider value={contextValue}>
      {children}
    </StatisticsContext.Provider>
  )
}
