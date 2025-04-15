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
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { BatchContext } from '../../contexts/BatchContext'
import { ManagerBatch } from '../../types'

const HandlePendingBatchesPage = () => {
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<ManagerBatch | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [filteredStatus, setFilteredStatus] = useState<'all' | 'pending'>('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const batchContext = useContext(BatchContext)
  if (!batchContext) {
    throw new Error("BatchContext doit être utilisé à l'intérieur d'un BatchProvider")
  }

  const { 
    managerBatches, 
    isLoading: batchesLoading, 
    error: batchesError,
    fetchManagerBatches,
    acceptBatch,
    rejectBatch
  } = batchContext

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    
    const pendingCount = managerBatches.filter(batch => 
      batch.status === 'PENDING'
    ).length
    
    const approvedToday = managerBatches.filter(batch => 
      batch.status === 'APPROVED' && 
      batch.createdAt.startsWith(today)
    ).length
    
    const rejectedToday = managerBatches.filter(batch => 
      batch.status === 'REJECTED' && 
      batch.createdAt.startsWith(today)
    ).length
    
    return {
      totalPending: pendingCount,
      approvedToday,
      rejectedToday
    }
  }, [managerBatches])

  const filteredBatches = useMemo(() => {
    if (filteredStatus === 'all') {
      return managerBatches
    } else {
      return managerBatches.filter(batch => batch.status === 'PENDING')
    }
  }, [managerBatches, filteredStatus])

  useEffect(() => {
    const loadManagerBatches = async () => {
      setLoading(true)
      try {
        await fetchManagerBatches()
        console.log('Lots en attente chargés avec succès')
      } catch (err) {
        console.error('Erreur lors du chargement des lots en attente:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    loadManagerBatches()
  }, [fetchManagerBatches])

  const handleAccept = useCallback(async (batchId: number) => {
    setLoading(true);
    try {
      await acceptBatch(batchId);
    } catch (err) {
      console.error('Erreur lors de l\'acceptation du lot:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [acceptBatch]);

  const handleRejectClick = (batch: ManagerBatch) => {
    setSelectedBatch(batch)
    setRejectionDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedBatch || !rejectionReason.trim()) return;
    
    setLoading(true);
    try {
      await rejectBatch(selectedBatch.id, rejectionReason);
      
      // Actions locales après le succès
      setRejectionDialogOpen(false);
      setRejectionReason('');
      setSelectedBatch(null);
    } catch (err) {
      console.error('Erreur lors du rejet du lot:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (batch: ManagerBatch) => {
    setSelectedBatch(batch)
    setDetailsDialogOpen(true)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Gestion des Lots en Attente
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" color="textSecondary">Lots en attente</Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stats.totalPending}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#e8f5e9' }}>
            <Typography variant="h6" color="textSecondary">Approuvés aujourd'hui</Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
              {stats.approvedToday}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#ffebee' }}>
            <Typography variant="h6" color="textSecondary">Rejetés aujourd'hui</Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
              {stats.rejectedToday}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={filteredStatus} 
          onChange={(_, newValue) => setFilteredStatus(newValue)}
        >
          <Tab value="all" label="Tous" />
          <Tab value="pending" label="En attente" />
        </Tabs>
      </Box>

      {(loading || batchesLoading) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error || batchesError ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
          {error || batchesError}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredBatches.length > 0 ? filteredBatches.map(batch => (
            <Grid item key={batch.id} xs={12}>
              <Card elevation={2}>
                <Box sx={{ display: 'flex' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 200, height: 200, objectFit: 'cover' }}
                    image={batch.imageLocation}
                    alt={batch.productName}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography component="div" variant="h5">
                            {batch.productName}
                          </Typography>
                          <Typography variant="subtitle1" color="text.secondary">
                            {batch.producerName}
                          </Typography>
                          <Chip 
                            label={batch.productType} 
                            size="small" 
                            sx={{ mt: 1, mb: 2, bgcolor: 'primary.light', color: 'white' }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {batch.unitPrice} € / {batch.unitType}
                          </Typography>
                          <Typography variant="body2">
                            Quantité: {batch.availableQuantity} {batch.unitType}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {batch.description.substring(0, 150)}
                        {batch.description.length > 150 ? '...' : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2">
                          <strong>Date de disponibilité:</strong> {new Date(batch.availabilityDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date de création:</strong> {new Date(batch.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewDetails(batch)}
                      >
                        Détails
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleOutlineIcon />}
                        onClick={() => handleAccept(batch.id)}
                      >
                        Accepter
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={() => handleRejectClick(batch)}
                      >
                        Rejeter
                      </Button>
                    </CardActions>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )) : (
            <Typography variant="body1" sx={{ textAlign: 'center', width: '100%', my: 4 }}>
              Aucun lot en attente.
            </Typography>
          )}
        </Grid>
      )}

      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)}>
        <DialogTitle>Raison du rejet</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez expliquer pourquoi ce lot est rejeté. Cette information sera envoyée au producteur.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Raison du rejet"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleRejectConfirm} color="error" disabled={!rejectionReason.trim()}>
            Confirmer le rejet
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
                    <Typography variant="h5">{selectedBatch.productName}</Typography>
                    <Chip 
                      label={selectedBatch.productType} 
                      size="small" 
                      sx={{ maxWidth: 'fit-content', bgcolor: 'primary.light', color: 'white' }}
                    />
                    <Typography variant="body1">{selectedBatch.description}</Typography>
                    <Divider />
                    <Typography variant="subtitle2">
                      <strong>Prix unitaire:</strong> {selectedBatch.unitPrice} € / {selectedBatch.unitType}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Quantité disponible:</strong> {selectedBatch.availableQuantity} {selectedBatch.unitType}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Date de disponibilité:</strong> {new Date(selectedBatch.availabilityDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Producteur:</strong> {selectedBatch.producerName}
                    </Typography>
                    <Typography variant="subtitle2">
                      <strong>Date de création:</strong> {new Date(selectedBatch.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
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