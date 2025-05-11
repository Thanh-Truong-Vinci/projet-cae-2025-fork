import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Container,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CardMedia,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DoneIcon from '@mui/icons-material/Done'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { BatchContext } from '../../contexts/BatchContext'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import { ReservationStatus } from '../../types'

const VolunteerHomePage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
  const batchContext = useContext(BatchContext)
  const reservationContext = useContext(ReservationContext)

  if (!reservationContext) {
    throw new Error(
      'ReservationContext must be used within a ReservationProvider'
    )
  }

  const {
    reservations,
    fetchAllReservations,
    toConfirmReservation,
    cancelReservation,
    createReservation,
  } = reservationContext

  useEffect(() => {
    fetchAllReservations()
  }, [fetchAllReservations])

  if (!batchContext) {
    throw new Error(
      'BatchContext doit être utilisé à l intérieur d un BatchProvider'
    )
  }

  const {
    approvedBatches,
    receivedBatches,
    isLoading,
    error,
    receiveBatch,
    fetchReceivedBatches,
  } = batchContext

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )
  const [expandedReservationId, setExpandedReservationId] = useState<
    number | null
  >(null)

  // États pour la vente libre
  const [openVenteLibreDialog, setOpenVenteLibreDialog] = useState(false)
  const [selectedVenteBatchId, setSelectedVenteBatchId] = useState<
    number | null
  >(null)
  const [venteLibreQuantity, setVenteLibreQuantity] = useState<number>(1)
  const [loadingReceivedBatches, setLoadingReceivedBatches] =
    useState<boolean>(false)

  // Filter reservations to only include those in 'Pending' state
  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === ReservationStatus.PENDING
  )

  // Redirect if not authenticated or not a volunteer
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Volunteer') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  // Load received batches when vente libre dialog opens
  const handleOpenVenteLibre = async () => {
    setLoadingReceivedBatches(true)
    try {
      await fetchReceivedBatches()
      setOpenVenteLibreDialog(true)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setSnackbarMessage('Erreur lors du chargement des produits disponibles')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoadingReceivedBatches(false)
    }
  }

  // Handle receive button click
  const handleReceiveClick = (batchId: number) => {
    setSelectedBatchId(batchId)
    setOpenDialog(true)
  }

  // Handle confirmation of receiving a batch
  const handleConfirmReceive = async () => {
    if (selectedBatchId === null) return

    try {
      await receiveBatch(selectedBatchId)
      setSnackbarMessage('Lot marqué comme reçu avec succès')
      setSnackbarSeverity('success')
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la réception du lot'
      )
      setSnackbarSeverity('error')
    } finally {
      setOpenDialog(false)
      setOpenSnackbar(true)
    }
  }

  // Handle confirm button click for reservations
  const handleConfirmReservation = async (reservationId: number) => {
    try {
      await toConfirmReservation(reservationId)
      setSnackbarMessage('Réservation confirmée avec succès')
      setSnackbarSeverity('success')
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la confirmation de la réservation'
      )
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
    }
  }

  // Handle cancel button click for reservations
  const handleCancelReservation = async (reservationId: number) => {
    try {
      await cancelReservation(reservationId)
      setSnackbarMessage('Réservation annulée avec succès')
      setSnackbarSeverity('success')
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'annulation de la réservation"
      )
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
    }
  }

  const handleToggleExpand = (reservationId: number) => {
    setExpandedReservationId(
      expandedReservationId === reservationId ? null : reservationId
    )
  }

  // Handle vente libre confirmation
  const handleConfirmVenteLibre = async () => {
    if (!selectedVenteBatchId || venteLibreQuantity <= 0) {
      setSnackbarMessage(
        'Veuillez sélectionner un produit et une quantité valide'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    try {
      await createReservation(selectedVenteBatchId, venteLibreQuantity)
      setSnackbarMessage('Vente libre enregistrée avec succès')
      setSnackbarSeverity('success')
      setOpenVenteLibreDialog(false)
      // Réinitialiser les valeurs
      setSelectedVenteBatchId(null)
      setVenteLibreQuantity(1)
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la création de la vente libre'
      )
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
    }
  }

  // If not authenticated or not a volunteer, don't render content
  if (!authenticatedUser || authenticatedUser.role !== 'Volunteer') {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        color="primary"
      >
        Tableau de bord bénévole
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Lots à recevoir
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : approvedBatches.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Aucun lot approuvé à recevoir pour le moment.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Prix unitaire</TableCell>
                  <TableCell>Disponible le</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvedBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Image handling similar to HomePage */}
                        <CardMedia
                          component="img"
                          image={
                            batch.imageUrl || 'https://via.placeholder.com/150'
                          }
                          alt={batch.productName}
                          sx={{
                            width: 60,
                            height: 60,
                            mr: 2,
                            objectFit: 'cover',
                            borderRadius: 1,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                        {/* Product name with better formatting */}
                        <Typography variant="subtitle1" component="div">
                          {batch.productName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {/* Product type with category formatting like in HomePage */}
                      <Chip
                        label={batch.productType}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography>
                        <strong>{batch.availableQuantity}</strong>{' '}
                        {batch.unitType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {batch.unitPrice.toFixed(2)}€/{batch.unitType}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(batch.availabilityDate),
                        'dd MMMM yyyy',
                        { locale: fr }
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<DoneIcon />}
                        onClick={() => handleReceiveClick(batch.id)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Recevoir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Réservations en attente
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : pendingReservations.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Aucune réservation en attente pour le moment.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Date de réservation</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell></TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingReservations.map((reservation) => (
                  <React.Fragment key={reservation.id}>
                    <TableRow>
                      <TableCell>{reservation.clientId}</TableCell>
                      <TableCell>
                        {format(
                          new Date(reservation.reservationDate),
                          'dd MMMM yyyy',
                          {
                            locale: fr,
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {reservation.price > 0
                          ? reservation.price.toFixed(2)
                          : reservation.reservationLines
                              .reduce(
                                (total, line) =>
                                  total + line.quantity * line.unitPrice,
                                0
                              )
                              .toFixed(2)}
                        €
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="text"
                          color="secondary"
                          onClick={() => handleToggleExpand(reservation.id)}
                          startIcon={
                            expandedReservationId === reservation.id ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )
                          }
                        >
                          {expandedReservationId === reservation.id
                            ? 'Cacher'
                            : 'Détails'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleConfirmReservation(reservation.id)
                            }
                          >
                            Confirmer
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                          >
                            Annuler
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {expandedReservationId === reservation.id && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: '#f9f9f9',
                              borderRadius: 1,
                            }}
                          >
                            <Typography variant="h6" gutterBottom>
                              Lignes de réservation
                            </Typography>
                            {reservation.reservationLines.length > 0 ? (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Nom du produit</TableCell>
                                    <TableCell>Quantité</TableCell>
                                    <TableCell>Prix</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {reservation.reservationLines.map((line) => (
                                    <TableRow key={line.id}>
                                      <TableCell>
                                        <CardMedia
                                          component="img"
                                          image={
                                            line.imageLocation ||
                                            'https://via.placeholder.com/150'
                                          }
                                          alt={line.productName}
                                          sx={{
                                            width: 60,
                                            height: 60,
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>{line.productName}</TableCell>
                                      <TableCell>
                                        {line.quantity}
                                        {line.unitType}
                                      </TableCell>
                                      <TableCell>
                                        {(
                                          line.quantity * line.unitPrice
                                        ).toFixed(2)}
                                        €
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <Typography>
                                Aucune ligne de réservation disponible.
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Bouton Vente Libre en bas de page */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          startIcon={<ShoppingCartIcon />}
          onClick={handleOpenVenteLibre}
          sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}
        >
          Vente libre
        </Button>
      </Box>

      {/* Confirmation Dialog for batch reception */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer la réception</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir marquer ce lot comme reçu? Cette action ne
            peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="primary"
            data-testid="dialog-cancel-button"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmReceive}
            color="primary"
            variant="contained"
            data-testid="dialog-confirm-button"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Vente Libre */}
      <Dialog
        open={openVenteLibreDialog}
        onClose={() => setOpenVenteLibreDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Vente Libre</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sélectionnez un produit et une quantité pour créer une vente libre.
            Le client par défaut "clientlibre@example.com" sera utilisé.
          </DialogContentText>

          {loadingReceivedBatches ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : receivedBatches.length === 0 ? (
            <Alert severity="info">
              Aucun produit disponible en stock pour la vente libre.
            </Alert>
          ) : (
            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Produit</InputLabel>
                <Select
                  value={selectedVenteBatchId || ''}
                  onChange={(e) =>
                    setSelectedVenteBatchId(e.target.value as number)
                  }
                  label="Produit"
                >
                  {receivedBatches.map((batch) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CardMedia
                          component="img"
                          image={
                            batch.imageUrl || 'https://via.placeholder.com/150'
                          }
                          alt={batch.productName}
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 2,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <div>
                          <Typography variant="body1">
                            {batch.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {batch.availableQuantity} {batch.unitType}{' '}
                            disponible -{batch.unitPrice.toFixed(2)}€/
                            {batch.unitType}
                          </Typography>
                        </div>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedVenteBatchId && (
                <TextField
                  label="Quantité"
                  type="number"
                  value={venteLibreQuantity}
                  onChange={(e) =>
                    setVenteLibreQuantity(
                      Math.max(1, parseInt(e.target.value) || 0)
                    )
                  }
                  fullWidth
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ mb: 2 }}
                  helperText={
                    selectedVenteBatchId
                      ? `Quantité maximale disponible: ${
                          receivedBatches.find(
                            (batch) => batch.id === selectedVenteBatchId
                          )?.availableQuantity || 0
                        }`
                      : ''
                  }
                />
              )}

              {selectedVenteBatchId && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Récapitulatif
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography>Produit:</Typography>
                    <Typography fontWeight="bold">
                      {
                        receivedBatches.find(
                          (b) => b.id === selectedVenteBatchId
                        )?.productName
                      }
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography>Prix unitaire:</Typography>
                    <Typography fontWeight="bold">
                      {receivedBatches
                        .find((b) => b.id === selectedVenteBatchId)
                        ?.unitPrice.toFixed(2)}
                      €
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography>Quantité:</Typography>
                    <Typography fontWeight="bold">
                      {venteLibreQuantity}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 2,
                    }}
                  >
                    <Typography fontWeight="bold">Total:</Typography>
                    <Typography fontWeight="bold" color="primary">
                      {(
                        venteLibreQuantity *
                        (receivedBatches.find(
                          (b) => b.id === selectedVenteBatchId
                        )?.unitPrice || 0)
                      ).toFixed(2)}
                      €
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenVenteLibreDialog(false)}
            color="primary"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmVenteLibre}
            color="primary"
            variant="contained"
            disabled={!selectedVenteBatchId || venteLibreQuantity <= 0}
          >
            Confirmer la vente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default VolunteerHomePage
