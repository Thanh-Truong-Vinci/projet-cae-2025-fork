import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { BatchContext } from '../../contexts/BatchContext';
import { fetchNotificationsAPI } from '../../contexts/NotificationProvider';
import { Notification } from '../../types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';

const NotificationsPage = () => {
  const { authenticatedUser } = useContext(UserContext);
  const batchContext = useContext(BatchContext);
  const myBatches = batchContext?.myBatches || [];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!authenticatedUser) return;
      try {
        const data = await fetchNotificationsAPI(authenticatedUser.token);
        setNotifications(data);
      } catch (err) {
        console.error('error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [authenticatedUser]);

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
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes Notifications
      </Typography>
      {notifications.length === 0 ? (
        <Typography variant="body1">Aucune notification disponible.</Typography>
      ) : (
        <Grid container spacing={2}>
          {notifications.map((notification) => {
            const batch = myBatches.find(
              (b) => b.id === notification.batchId
            );
            return (
              <Grid item xs={12} key={notification.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{notification.message}</Typography>
                    {notification.reasonOfReject && (
                      <Typography variant="body2" color="error">
                        Raison du rejet: {notification.reasonOfReject}
                      </Typography>
                    )}
                    {batch ? (
                      <>
                        <Typography variant="body2">
                          Produit: {batch.productName}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Lot introuvable
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      Date:{' '}
                      {new Date(notification.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default NotificationsPage;