import React, { createContext, useState, useEffect, useContext } from 'react'
import { Notification, NotificationContextType } from '../types'
import { 
  fetchNotificationsAPI, 
  fetchUnreadNotificationsCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from './NotificationProvider'
import { UserContext } from './UserContext'

// Création du contexte avec une valeur par défaut
export const NotificationContext = createContext<NotificationContextType>({
  fetchNotifications: async () => [],
  unreadCount: 0,
  fetchUnreadCount: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
})

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const { authenticatedUser } = useContext(UserContext)

  const fetchNotifications = async (token: string): Promise<Notification[]> => {
    try {
      const notifications = await fetchNotificationsAPI(token)
      return notifications
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      return []
    }
  }

  const fetchUnreadCount = async (token: string): Promise<void> => {
    try {
      const count = await fetchUnreadNotificationsCount(token)
      setUnreadCount(count)
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error)
      setUnreadCount(0)
    }
  }

  const markAsRead = async (notificationId: number, token: string): Promise<void> => {
    try {
      await markNotificationAsRead(notificationId, token)
      // Mise à jour du compteur après le marquage
      fetchUnreadCount(token)
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error)
    }
  }

  const markAllAsRead = async (token: string): Promise<void> => {
    try {
      await markAllNotificationsAsRead(token)
      // Mise à jour du compteur après le marquage de toutes les notifications
      setUnreadCount(0)
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error)
    }
  }

  // Charger le nombre de notifications non lues au chargement du composant
  useEffect(() => {
    if (authenticatedUser && authenticatedUser.role === 'Producer') {
      fetchUnreadCount(authenticatedUser.token)
    }
  }, [authenticatedUser])

  return (
    <NotificationContext.Provider
      value={{
        fetchNotifications,
        unreadCount,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider