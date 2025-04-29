import { Notification } from '../types'

export const createNotification = async (
  notification: { batchId: number; message: string; reasonOfReject?: string },
  token: string
): Promise<void> => {
  console.log('Appel API pour créer une notification :', notification)

  const response = await fetch('/api/notifications/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(notification),
  })

  if (!response.ok) {
    console.error(
      'Erreur lors de la création de la notification :',
      response.statusText
    )
    throw new Error(`Error creating notification: ${response.statusText}`)
  }

  console.log('Notification créée avec succès dans le backend')
}

export const fetchNotificationsAPI = async (
  token: string
): Promise<Notification[]> => {
  console.log('notificationApi: GET /api/notifications/producer, token=', token)
  const response = await fetch('/api/notifications/producer', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  })
  console.log('notificationApi: response status=', response.status)

  if (!response.ok) {
    console.error('notificationApi: erreur fetchNotifs:', response.statusText)
    throw new Error(`Error fetching notifications: ${response.statusText}`)
  }

  const raw = await response.json()
  console.log('notificationApi: data reçue =', raw)

  // Utilisez un type explicite au lieu de any
  const data: Notification[] = raw.map(
    (notification: {
      idNotification?: number
      id?: number
      message?: string
      reasonOfReject?: string
      batch?: { id: number }
      producer?: unknown
      read: boolean
      date: string
    }) => ({
      id: notification.idNotification || notification.id || 0,
      message: notification.message || '',
      reasonOfReject: notification.reasonOfReject,
      batchId: notification.batch ? notification.batch.id : null,
      producer: notification.producer || null,
      read: notification.read,
      date: new Date(notification.date),
    })
  )
  console.log('notificationApi: data transformée =', data)
  return data
}

// Fonction pour récupérer le nombre de notifications non lues
export const fetchUnreadNotificationsCount = async (token: string): Promise<number> => {
  try {
    const notifications = await fetchNotificationsAPI(token)
    return notifications.filter(notification => !notification.read).length
  } catch (error) {
    console.error('Erreur lors du comptage des notifications non lues:', error)
    return 0
  }
}

// Fonction pour marquer une notification comme lue
export const markNotificationAsRead = async (
  notificationId: number,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })

    if (!response.ok) {
      throw new Error(`Error marking notification as read: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error)
    throw error
  }
}

// Fonction pour marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (token: string): Promise<void> => {
  try {
    const response = await fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })

    if (!response.ok) {
      throw new Error(`Error marking all notifications as read: ${response.statusText}`)
    }
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error)
    throw error
  }
}