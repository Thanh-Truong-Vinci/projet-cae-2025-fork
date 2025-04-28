import { Notification } from '../types';

export const createNotification = async (
  notification: { batchId: number; message: string; reasonOfReject?: string },
  token: string,
): Promise<void> => {
  console.log('Appel API pour créer une notification :', notification);

  const response = await fetch('/api/notifications/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notification),
  });

  if (!response.ok) {
    console.error(
      'Erreur lors de la création de la notification :',
      response.statusText,
    );
    throw new Error(`Error creating notification: ${response.statusText}`);
  }

  console.log('Notification créée avec succès dans le backend');
};

export const fetchNotificationsAPI = async (
  token: string,
): Promise<Notification[]> => {
  console.log('notificationApi: GET /api/notifications/producer, token=', token);
  const response = await fetch('/api/notifications/producer', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('notificationApi: response status=', response.status);

  if (!response.ok) {
    console.error('notificationApi: erreur fetchNotifs:', response.statusText);
    throw new Error(`Error fetching notifications: ${response.statusText}`);
  }

  const raw = await response.json();
  console.log('notificationApi: data reçue =', raw);
  const data: Notification[] = raw.map((notification: any) => ({
    id: notification.idNotification || notification.id,
    message: notification.message || '',
    reasonOfReject: notification.reasonOfReject,
    batchId: notification.batch ? notification.batch.id : null,
    producer: notification.producer || null,
    read: notification.read,
    date: new Date(notification.date),
  }));
  console.log('notificationApi: data transformée =', data);
  return data;
};