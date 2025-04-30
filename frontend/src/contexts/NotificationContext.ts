import { createContext } from 'react'
import { NotificationContextType } from '../types'

export const NotificationContext = createContext<NotificationContextType>({
  fetchNotifications: async () => [],
  unreadCount: 0,
  fetchUnreadCount: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
})
