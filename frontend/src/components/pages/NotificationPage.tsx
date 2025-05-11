import { useContext, useState, useEffect, useCallback } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { BatchContext } from '../../contexts/BatchContext'
import { NotificationContext } from '../../contexts/NotificationContext'
import { Notification } from '../../types'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Divider,
  Snackbar,
  IconButton,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead'

const NotificationsPage = () => {
  const { authenticatedUser } = useContext(UserContext)
  const batchContext = useContext(BatchContext)
  const { fetchNotifications, markAsRead, markAllAsRead, fetchUnreadCount } =
    useContext(NotificationContext)
  const myBatches = batchContext?.myBatches || []
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string>('')

  const loadNotifications = useCallback(async () => {
    if (!authenticatedUser) return
    try {
      console.log(
        'Chargement des notifications avec token:',
        authenticatedUser.token
      )
      const data = await fetchNotifications(authenticatedUser.token)
      console.log('Notifications reçues:', data)
      setNotifications(data)
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
  }, [authenticatedUser, fetchNotifications])

  useEffect(() => {
    if (authenticatedUser) {
      loadNotifications()
    } else {
      setLoading(false)
      setError('Vous devez être connecté pour voir vos notifications')
    }
  }, [authenticatedUser, loadNotifications])

  const handleMarkAsRead = async (notificationId: number) => {
    if (!authenticatedUser) return

    try {
      setLoading(true)
      await markAsRead(notificationId, authenticatedUser.token)

      // Mettre à jour la liste des notifications
      await loadNotifications()

      // Mettre à jour le compteur des notifications non lues
      await fetchUnreadCount(authenticatedUser.token)

      setSnackbarMessage('Notification marquée comme lue')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du marquage de la notification'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!authenticatedUser) return

    try {
      setLoading(true)
      await markAllAsRead(authenticatedUser.token)

      // Mettre à jour la liste des notifications
      await loadNotifications()

      // Mettre à jour le compteur des notifications non lues
      await fetchUnreadCount(authenticatedUser.token)

      setSnackbarMessage('Toutes les notifications ont été marquées comme lues')
      setSnackbarOpen(true)
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors du marquage de toutes les notifications'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

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

  // Filtrer les notifications non lues
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  )
  const hasUnreadNotifications = unreadNotifications.length > 0

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Mes Notifications</Typography>
        {hasUnreadNotifications && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            disabled={loading}
          >
            Tout marquer comme lu
          </Button>
        )}
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
                    boxShadow: isNew ? 3 : 1,
                  }}
                >
                  {isNew && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Chip label="Nouveau" color="error" size="small" />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Marquer comme lu"
                      >
                        <MarkChatReadIcon />
                      </IconButton>
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="h6">{notification.message}</Typography>
                    {notification.reasonOfReject && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: 'error.light',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.primary">
                          <strong>Raison du rejet:</strong>{' '}
                          {notification.reasonOfReject}
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
                        <strong>Lot ID:</strong>{' '}
                        {notification.batchId || 'Non spécifié'}
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
                              minute: '2-digit',
                            }
                          )
                        : 'Non spécifiée'}
                    </Typography>
                    {isNew && (
                      <Box
                        sx={{
                          mt: 2,
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marquer comme lu
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  )
}

export default NotificationsPage
