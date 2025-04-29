import { useContext, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  CardActions,
  Divider,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { BatchContext } from '../../contexts/BatchContext'
import { PendingBatch } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import { createNotification } from '../../contexts/NotificationProvider'

const HandlePendingBatchesPage = () => {
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<PendingBatch | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedUser } = useContext(UserContext)

  const batchContext = useContext(BatchContext)
  if (!batchContext) {
    throw new Error(
      "BatchContext doit être utilisé à l'intérieur d'un BatchProvider"
    )
  }

  const {
    pendingBatches,
    isLoading: batchesLoading,
    error: batchesError,
    fetchPendingBatches,
    acceptBatch,
    rejectBatch,
  } = batchContext

  const stats = useMemo(() => {
    return {
      totalPending: pendingBatches.length,
    }
  }, [pendingBatches])

  // Chargement initial des lots
  useEffect(() => {
    const loadPendingBatches = async () => {
      setLoading(true)
      try {
        await fetchPendingBatches()
        console.log('Lots en attente chargés avec succès')
      } catch (err) {
        console.error('Erreur lors du chargement des lots en attente:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    loadPendingBatches()
  }, [fetchPendingBatches])

  const handleAccept = useCallback(
    async (batchId: number) => {
      setLoading(true)
      try {
        await acceptBatch(batchId)

        // Ajout de la notification après acceptation du lot
        if (authenticatedUser) {
          const notification = {
            batchId: batchId,
            message: 'Le lot a été accepté',
          }
          console.log('Notification construite :', notification)
          try {
            await createNotification(notification, authenticatedUser.token)
            console.log('Notification envoyée avec succès')
          } catch (err) {
            console.error("Erreur lors de l'envoi de la notification :", err)
          }
        }

        setError(null)
      } catch (err) {
        console.error("Erreur lors de l'acceptation du lot:", err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    },
    [acceptBatch, authenticatedUser]
  )

  const handleRejectClick = (batch: PendingBatch) => {
    setSelectedBatch(batch)
    setRejectionDialogOpen(true)
  }

  const handleRejectConfirm = useCallback(async () => {
    if (!selectedBatch) return

    setLoading(true)
    try {
      await rejectBatch(selectedBatch.id, rejectionReason)

      // Ajout de la notification après le rejet du lot
      if (authenticatedUser) {
        const notification = {
          batchId: selectedBatch.id,
          message: 'Le lot a été refusé',
          reasonOfReject: rejectionReason || 'Aucune raison spécifiée',
        }
        console.log('Notification construite :', notification)
        try {
          await createNotification(notification, authenticatedUser.token)
          console.log('Notification envoyée avec succès')
        } catch (err) {
          console.error("Erreur lors de l'envoi de la notification :", err)
        }
      }

      // Actions locales après le succès
      setRejectionDialogOpen(false)
      setRejectionReason('')
      setSelectedBatch(null)
      setError(null)
    } catch (err) {
      console.error('Erreur lors du rejet du lot:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [authenticatedUser, rejectBatch, selectedBatch, rejectionReason])

  const handleViewDetails = (batch: PendingBatch) => {
    setSelectedBatch(batch)
    setDetailsDialogOpen(true)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Gestion des Lots en Attente
      </Typography>

      <Grid item xs={12} md={4} sx={{ mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: '#f5f5f5',
          }}
        >
          <Typography variant="h6" color="textSecondary">
            Lots en attente
          </Typography>
          <Typography
            variant="h3"
            component="div"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {stats.totalPending}
          </Typography>
        </Paper>
      </Grid>

      {loading || batchesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error || batchesError ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
          {error || batchesError}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {pendingBatches.length > 0 ? (
            pendingBatches.map((batch) => (
              <Grid item key={batch.id} xs={12}>
                <Card elevation={2}>
                  <Box sx={{ display: 'flex' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 200, height: 200, objectFit: 'cover' }}
                      image={batch.imageLocation}
                      alt={batch.productName}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                      }}
                    >
                      <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Box>
                            <Typography component="div" variant="h5">
                              {batch.productName}
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              color="text.secondary"
                            >
                              {batch.producerName}
                            </Typography>
                            <Chip
                              label={batch.productType}
                              size="small"
                              sx={{
                                mt: 1,
                                mb: 2,
                                bgcolor: 'primary.light',
                                color: 'white',
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 'bold' }}
                            >
                              {batch.unitPrice} € / {batch.unitType}
                            </Typography>
                            <Typography variant="body2">
                              Quantité: {batch.availableQuantity}{' '}
                              {batch.unitType}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          {batch.description.substring(0, 150)}
                          {batch.description.length > 150 ? '...' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="body2">
                            <strong>Date de disponibilité:</strong>{' '}
                            {new Date(
                              batch.availabilityDate
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Date de création:</strong>{' '}
                            {new Date(batch.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(batch)}
                          disabled={loading}
                        >
                          Détails
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleOutlineIcon />}
                          onClick={() => handleAccept(batch.id)}
                          disabled={loading}
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<CancelOutlinedIcon />}
                          onClick={() => handleRejectClick(batch)}
                          disabled={loading}
                        >
                          Rejeter
                        </Button>
                      </CardActions>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              variant="body1"
              sx={{ textAlign: 'center', width: '100%', my: 4 }}
            >
              Aucun lot en attente.
            </Typography>
          )}
        </Grid>
      )}

      <Dialog
        open={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
      >
        <DialogTitle>Raison du rejet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vous pouvez expliquer pourquoi ce lot est rejeté (optionnel). Cette
            information sera envoyée au producteur.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Raison du rejet (optionnelle)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
            inputProps={{ maxLength: 255 }}
            helperText={`${rejectionReason.length}/255 caractères`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            disabled={loading}
          >
            {loading ? 'Traitement...' : 'Confirmer le rejet'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBatch && (
          <>
            <DialogTitle>Détails du lot</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    image={selectedBatch.imageLocation}
                    alt={selectedBatch.productName}
                    sx={{ height: 300, objectFit: 'cover', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Typography variant="h5">
                      {selectedBatch.productName}
                    </Typography>
                    <Chip
                      label={selectedBatch.productType}
                      size="small"
                      sx={{
                        maxWidth: 'fit-content',
                        bgcolor: 'primary.light',
                        color: 'white',
                      }}
                    />
                    <Typography variant="body1">
                      {selectedBatch.description}
                    </Typography>
                    <Divider />
                    <Typography variant="subtitle2">
                      <strong>Prix unitaire:</strong> {selectedBatch.unitPrice}{' '}
                      € / {selectedBatch.unitType}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Quantité disponible:</strong>{' '}
                      {selectedBatch.availableQuantity} {selectedBatch.unitType}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Date de disponibilité:</strong>{' '}
                      {new Date(
                        selectedBatch.availabilityDate
                      ).toLocaleDateString()}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Producteur:</strong> {selectedBatch.producerName}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Date de création:</strong>{' '}
                      {new Date(selectedBatch.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Fermer
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => {
                  setDetailsDialogOpen(false)
                  handleAccept(selectedBatch.id)
                }}
              >
                Accepter
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => {
                  setDetailsDialogOpen(false)
                  handleRejectClick(selectedBatch)
                }}
              >
                Rejeter
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default HandlePendingBatchesPage