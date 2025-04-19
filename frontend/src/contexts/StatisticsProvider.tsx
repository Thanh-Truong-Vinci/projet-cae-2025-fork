import { useState, useCallback, ReactNode, useContext } from 'react'
import { StatisticsContext } from './StatisticsContext'
import { SalesStatistics, StatisticsContextType } from '../types'
import { UserContext } from './UserContext'

interface StatisticsProviderProps {
  children: ReactNode
}

export const StatisticsProvider = ({ children }: StatisticsProviderProps) => {
  const [salesStatistics, setSalesStatistics] = useState<SalesStatistics[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const { authenticatedUser } = useContext(UserContext)

  const fetchSalesStatistics = useCallback(
    async (year?: number, month?: number) => {
      if (!authenticatedUser || authenticatedUser.role !== 'Manager') {
        setError('Vous devez être connecté en tant que gestionnaire')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let url = '/api/statistics/sales'
        const params = new URLSearchParams()

        if (year) params.append('year', year.toString())
        if (month) params.append('month', month.toString())

        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url, {
          headers: {
            Authorization: authenticatedUser.token,
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setSalesStatistics(data)
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
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
