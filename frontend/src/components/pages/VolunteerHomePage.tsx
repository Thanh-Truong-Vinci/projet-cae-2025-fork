import React, { useState, useEffect, useContext, useCallback } from 'react'
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
  Avatar,
} from '@mui/material'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import ExpandMoreIcon from '@mui/icons-material/ExpandLess'
import ExpandLessIcon from '@mui/icons-material/ExpandMore'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import { ProductBatch, ReservationStatus } from '../../types'

const VolunteerHomePage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
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
    reserveDirect,
  } = reservationContext

  useEffect(() => {
    fetchAllReservations()
  }, [fetchAllReservations])

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )
  const [expandedReservationId, setExpandedReservationId] = useState<
    number | null
  >(null)

  const [openVenteLibreDialog, setOpenVenteLibreDialog] = useState(false)
  const [selectedVenteBatchId, setSelectedVenteBatchId] = useState<
    number | null
  >(null)
  const [venteLibreQuantity, setVenteLibreQuantity] = useState<number>(1)
  const [loadingReceivedBatches, setLoadingReceivedBatches] =
    useState<boolean>(false)
  const [agglomeratedProducts, setAgglomeratedProducts] = useState<
    ProductBatch[]
  >([])
  const [, setLoadingAgglomerated] = useState<boolean>(false)

  const [openStockDialog, setOpenStockDialog] = useState(false)
  const [selectedStockBatchId, setSelectedStockBatchId] = useState<
    number | null
  >(null)
  const [stockReductionQuantity, setStockReductionQuantity] = useState(1)

  const fetchAgglomeratedProducts = useCallback(async () => {
    try {
      setLoadingAgglomerated(true)
      const response = await fetch('/api/batches/received/available-view')

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAgglomeratedProducts(data)
    } catch (err) {
      console.error('Error fetching agglomerated products:', err)
      setSnackbarMessage(
        err instanceof Error
          ? `Erreur: ${err.message}`
          : 'Erreur lors du chargement des produits'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      setAgglomeratedProducts([])
    } finally {
      setLoadingAgglomerated(false)
    }
  }, [setSnackbarMessage, setSnackbarSeverity, setOpenSnackbar])

  useEffect(() => {
    if (authenticatedUser?.role === 'Volunteer') {
      fetchAgglomeratedProducts()
    }
  }, [authenticatedUser, fetchAgglomeratedProducts])

  const handleOpenVenteLibre = async () => {
    setLoadingReceivedBatches(true)
    try {
      await fetchAgglomeratedProducts()
      setOpenVenteLibreDialog(true)
    } catch (err) {
      console.error('Erreur chargement produits:', err)
      setSnackbarMessage(
        err instanceof Error
          ? `Erreur: ${err.message}`
          : 'Erreur lors du chargement des produits disponibles'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoadingReceivedBatches(false)
    }
  }

  const handleOpenStockReduction = async () => {
    setLoadingReceivedBatches(true)
    try {
      await fetchAgglomeratedProducts()
      setOpenStockDialog(true)
    } catch (err) {
      console.error('Erreur chargement produits:', err)
      setSnackbarMessage(
        err instanceof Error
          ? `Erreur: ${err.message}`
          : 'Erreur lors du chargement des produits disponibles'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setLoadingReceivedBatches(false)
    }
  }

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === ReservationStatus.PENDING
  )

  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Volunteer') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  const handleConfirmReservation = async (reservationId: number) => {
    try {
      await toConfirmReservation(reservationId)
      await fetchAllReservations()
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

  const handleConfirmVenteLibre = async () => {
    if (!selectedVenteBatchId || venteLibreQuantity <= 0) {
      setSnackbarMessage(
        'Veuillez sélectionner un produit et une quantité valide'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    // Find the selected agglomerated product
    const selectedProduct = agglomeratedProducts.find(
      (p) => p.productId === selectedVenteBatchId
    )

    if (!selectedProduct) {
      setSnackbarMessage('Produit non trouvé')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    // First close dialog and reset local state
    setOpenVenteLibreDialog(false)
    setSelectedVenteBatchId(null)
    setVenteLibreQuantity(1)

    let remainingQuantity = venteLibreQuantity

    try {
      // The backend already provides batchIds and batchQuantities arrays
      for (let i = 0; i < selectedProduct.batchIds.length; i++) {
        if (remainingQuantity <= 0) break

        const batchId = selectedProduct.batchIds[i]
        const availableQuantity = selectedProduct.batchQuantities[i]

        // Calculate how much to take from this batch
        const quantityFromThisBatch = Math.min(
          remainingQuantity,
          availableQuantity
        )

        // Reserve this quantity
        await reserveDirect(batchId, quantityFromThisBatch)

        // Reduce the remaining quantity
        remainingQuantity -= quantityFromThisBatch
      }

      // Show success message
      setSnackbarMessage('Vente libre enregistrée avec succès')
      setSnackbarSeverity('success')

      // Refresh data after a slight delay
      setTimeout(() => {
        fetchAgglomeratedProducts().catch(console.error)
        fetchAllReservations().catch(console.error)
      }, 500)
    } catch (error) {
      console.error('Erreur vente libre:', error)
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

  const handleConfirmStockReduction = async () => {
    if (!selectedStockBatchId || stockReductionQuantity <= 0) {
      setSnackbarMessage(
        'Veuillez sélectionner un produit et une quantité valide'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    const selectedProduct = agglomeratedProducts.find(
      (p) => p.productId === selectedStockBatchId
    )

    if (!selectedProduct) {
      setSnackbarMessage('Produit non trouvé')
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    // Fermer le dialogue et réinitialiser les états
    setOpenStockDialog(false)
    setSelectedStockBatchId(null)
    setStockReductionQuantity(1)

    let remainingQuantity = stockReductionQuantity

    try {
      // Parcourir les lots et réduire la quantité
      for (let i = 0; i < selectedProduct.batchIds.length; i++) {
        if (remainingQuantity <= 0) break

        const batchId = selectedProduct.batchIds[i]
        const availableQuantity = selectedProduct.batchQuantities[i]

        // Calculer combien prendre de ce lot
        const quantityFromThisBatch = Math.min(
          remainingQuantity,
          availableQuantity
        )

        // Appel API pour réduire la quantité
        const response = await fetch(
          `/api/batches/${batchId}/reduce-quantity?quantity=${quantityFromThisBatch}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: authenticatedUser?.token || '',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        // Réduire la quantité restante à traiter
        remainingQuantity -= quantityFromThisBatch
      }

      // Afficher un message de succès
      setSnackbarMessage('Quantité retirée du stock avec succès')
      setSnackbarSeverity('success')

      // Rafraîchir les données après un court délai
      setTimeout(() => {
        fetchAgglomeratedProducts().catch(console.error)
      }, 500)
    } catch (error) {
      console.error('Erreur lors de la réduction de stock:', error)
      setSnackbarMessage(
        error instanceof Error
          ? error.message
          : 'Erreur lors de la réduction de stock'
      )
      setSnackbarSeverity('error')
    } finally {
      setOpenSnackbar(true)
    }
  }

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
          Réservations en attente
        </Typography>

        {pendingReservations.length === 0 ? (
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

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
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

        <Button
          variant="contained"
          color="warning"
          size="large"
          startIcon={<RemoveCircleOutlineIcon />}
          onClick={handleOpenStockReduction}
          sx={{ py: 1.5, px: 4, fontWeight: 'bold' }}
        >
          Retirer du stock
        </Button>
      </Box>

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
          </DialogContentText>

          {loadingReceivedBatches ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : agglomeratedProducts.length === 0 ? (
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
                  {agglomeratedProducts.map((product) => (
                    <MenuItem key={product.productId} value={product.productId}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CardMedia
                          component="img"
                          image={
                            product.imageLocation ||
                            'https://via.placeholder.com/150'
                          }
                          alt={product.productName}
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
                            {product.productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.totalQuantity} {product.saleUnit}{' '}
                            disponible - {product.unitPrice.toFixed(2)}€/
                            {product.saleUnit}
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
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0
                    const selectedProduct = agglomeratedProducts.find(
                      (p) => p.productId === selectedVenteBatchId
                    )
                    const maxQuantity = selectedProduct
                      ? selectedProduct.totalQuantity
                      : 0
                    // Limiter la quantité à la valeur maximale disponible
                    setVenteLibreQuantity(
                      Math.min(Math.max(1, newValue), maxQuantity)
                    )
                  }}
                  fullWidth
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: selectedVenteBatchId
                        ? agglomeratedProducts.find(
                            (product) =>
                              product.productId === selectedVenteBatchId
                          )?.totalQuantity || 0
                        : 1,
                    },
                  }}
                  sx={{ mb: 2 }}
                  helperText={
                    selectedVenteBatchId
                      ? `Quantité maximale disponible: ${
                          agglomeratedProducts.find(
                            (product) =>
                              product.productId === selectedVenteBatchId
                          )?.totalQuantity || 0
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
                        agglomeratedProducts.find(
                          (p) => p.productId === selectedVenteBatchId
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
                      {agglomeratedProducts
                        .find((p) => p.productId === selectedVenteBatchId)
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
                        (agglomeratedProducts.find(
                          (p) => p.productId === selectedVenteBatchId
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

      <Dialog
        open={openStockDialog}
        onClose={() => setOpenStockDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Retirer des produits du stock</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sélectionnez un produit et une quantité à retirer du stock (pertes,
            produits périmés, etc.).
          </DialogContentText>

          {loadingReceivedBatches ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : agglomeratedProducts.length === 0 ? (
            <Alert severity="info">
              Aucun produit disponible en stock pour le retrait.
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Produit</InputLabel>
                <Select
                  value={selectedStockBatchId || ''}
                  onChange={(e) =>
                    setSelectedStockBatchId(e.target.value as number)
                  }
                  label="Produit"
                >
                  {agglomeratedProducts.map((product) => (
                    <MenuItem key={product.productId} value={product.productId}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.imageLocation && (
                          <Avatar
                            src={product.imageLocation}
                            alt={product.productName}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          />
                        )}
                        <div>
                          <Typography variant="subtitle1">
                            {product.productName} ({product.companyName})
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.totalQuantity} {product.saleUnit}{' '}
                            disponible - {product.unitPrice.toFixed(2)}€/
                            {product.saleUnit}
                          </Typography>
                        </div>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedStockBatchId && (
                <TextField
                  label="Quantité"
                  type="number"
                  value={stockReductionQuantity}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0
                    const selectedProduct = agglomeratedProducts.find(
                      (p) => p.productId === selectedStockBatchId
                    )
                    const maxQuantity = selectedProduct
                      ? selectedProduct.totalQuantity
                      : 0
                    // Limiter la quantité à la valeur maximale disponible
                    setStockReductionQuantity(
                      Math.min(Math.max(1, newValue), maxQuantity)
                    )
                  }}
                  fullWidth
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: selectedStockBatchId
                        ? agglomeratedProducts.find(
                            (product) =>
                              product.productId === selectedStockBatchId
                          )?.totalQuantity || 0
                        : 1,
                    },
                  }}
                  sx={{ mb: 2 }}
                  helperText={
                    selectedStockBatchId
                      ? `Quantité maximale disponible: ${
                          agglomeratedProducts.find(
                            (product) =>
                              product.productId === selectedStockBatchId
                          )?.totalQuantity || 0
                        }`
                      : ''
                  }
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStockDialog(false)}>Annuler</Button>
          <Button
            onClick={async () => {
              await handleConfirmStockReduction()
              // Rafraîchir les données et les réservations après confirmation
              fetchAllReservations().catch(console.error)
            }}
            variant="contained"
            color="primary"
            disabled={!selectedStockBatchId || stockReductionQuantity <= 0}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

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
