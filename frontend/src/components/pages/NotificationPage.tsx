import { useContext, useState, useEffect } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { BatchContext } from '../../contexts/BatchContext'
import { NotificationContext } from '../../contexts/NotifictaionContext'
import { Notification } from '../../types'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material'
import Grid from '@mui/material/Grid'

const NotificationsPage = () => {
  const { authenticatedUser } = useContext(UserContext)
  const batchContext = useContext(BatchContext)
  const { fetchNotifications, markAllAsRead } = useContext(NotificationContext)
  const myBatches = batchContext?.myBatches || []
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNotifications = async () => {
      if (!authenticatedUser) return
      try {
        console.log(
          'Chargement des notifications avec token:',
          authenticatedUser.token
        )
        const data = await fetchNotifications(authenticatedUser.token)
        console.log('Notifications reçues:', data)
        setNotifications(data)

        // Marquer toutes les notifications comme lues lorsque la page est chargée
        if (data.some(notification => !notification.read)) {
          await markAllAsRead(authenticatedUser.token)
        }
      } catch (err) {
        console.error('error fetching notifications:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des notifications'
        )
      } finally {
        setLoading(false)
      }
    }

    if (authenticatedUser) {
      loadNotifications()
    } else {
      setLoading(false)
      setError('Vous devez être connecté pour voir vos notifications')
    }
  }, [authenticatedUser, fetchNotifications, markAllAsRead])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Mes Notifications
        </Typography>
      </Box>
      
      {notifications.length === 0 ? (
        <Typography variant="body1">Aucune notification disponible.</Typography>
      ) : (
        <Grid container spacing={2}>
          {notifications.map((notification) => {
            const batch = myBatches.find((b) => b.id === notification.batchId)
            const isNew = !notification.read
            
            return (
              <Grid item xs={12} key={notification.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    border: isNew ? '1px solid #f50057' : 'none',
                    boxShadow: isNew ? 3 : 1
                  }}
                >
                  {isNew && (
                    <Chip 
                      label="Nouveau" 
                      color="error" 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        zIndex: 1 
                      }} 
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{notification.message}</Typography>
                    {notification.reasonOfReject && (
                      <Box sx={{ mt: 1, p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="error.dark">
                          <strong>Raison du rejet:</strong> {notification.reasonOfReject}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1.5 }} />
                    {batch ? (
                      <>
                        <Typography variant="body2">
                          <strong>Produit:</strong> {batch.productName}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Lot ID:</strong> {notification.batchId || 'Non spécifié'}
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      <strong>Date:</strong>{' '}
                      {notification.date
                        ? new Date(notification.date).toLocaleDateString(
                            'fr-FR',
                            { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )
                        : 'Non spécifiée'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

export default NotificationsPage