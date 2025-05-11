import { useContext, useState, useEffect, useRef, useCallback } from 'react'
import {
  Container,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
  Box,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import { BatchContext } from '../../contexts/BatchContext'
import { ReservationStatus, ReservationView, Batch } from '../../types'

const CartPage = () => {
  const { authenticatedUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [openCalendar, setOpenCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isDateValid, setIsDateValid] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')
  const reservationContext = useContext(ReservationContext)
  const batchContext = useContext(BatchContext)
  const [reservation, setReservation] = useState<ReservationView | null>(null)
  const [fetchTimestamp, setFetchTimestamp] = useState(0)
  const [maxQuantities, setMaxQuantities] = useState<{
    [lineId: number]: number
  }>({})
  const batchesCache = useRef<{ batches: Batch[]; timestamp: number }>({
    batches: [],
    timestamp: 0,
  })
  const CACHE_DURATION = 5000 // 5 secondes
  const BATCH_CACHE_DURATION = 60000 // 1 minute de cache pour les lots

  const getMaxQuantities = useCallback(
    async (res: ReservationView) => {
      if (!batchContext || !res?.reservationLines?.length) return

      const now = Date.now()

      if (
        batchesCache.current.batches.length &&
        now - batchesCache.current.timestamp < BATCH_CACHE_DURATION
      ) {
        updateMaxQuantitiesFromCache(res)
        return
      }

      try {
        const batches = await batchContext.fetchReceivedBatches()

        batchesCache.current = {
          batches: batches,
          timestamp: now,
        }

        updateMaxQuantitiesFromCache(res)
      } catch (error) {
        console.error('Erreur lors du chargement des lots:', error)
      }
    },
    [batchContext, batchesCache]
  )

  const updateMaxQuantitiesFromCache = (res: ReservationView) => {
    const quantities: { [lineId: number]: number } = {}

    res.reservationLines.forEach((line) => {
      const batch = batchesCache.current.batches.find(
        (b) => b.id === line.batchId
      )
      if (batch) {
        quantities[line.id] = batch.availableQuantity + line.quantity
      }
    })

    setMaxQuantities(quantities)
  }

  useEffect(() => {
    const now = Date.now()
    if (now - fetchTimestamp < CACHE_DURATION && reservation !== null) {
      return
    }

    if (reservationContext?.fetchReservations) {
      reservationContext.fetchReservations().then((r) => {
        const buildingReservation = r.find(
          (res) => res.status === ReservationStatus.BUILDING
        )
        setReservation(buildingReservation ?? null)
        setFetchTimestamp(now)

        if (buildingReservation) {
          getMaxQuantities(buildingReservation)
        }
      })
    }
  }, [fetchTimestamp, reservationContext, getMaxQuantities, reservation])

  const forceRefresh = () => {
    setFetchTimestamp(Date.now())
  }

  if (!reservationContext) {
    throw new Error(
      'ReservationContext must be used within a ReservationProvider'
    )
  }

  const getTomorrowFormatted = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const isTuesdayOrThursday = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDay()
    return day === 2 || day === 4
  }

  const getNextTuesdayOrThursday = () => {
    const today = new Date()

    // Créer une nouvelle date pour éviter de modifier today
    const date = new Date(today)

    // On commence à partir de demain
    date.setDate(date.getDate() + 1)

    // Cherche jusqu'à trouver un mardi (2) ou jeudi (4)
    while (date.getDay() !== 2 && date.getDay() !== 4) {
      date.setDate(date.getDate() + 1)
    }

    // Formater la date en YYYY-MM-DD
    return date.toISOString().split('T')[0]
  }

  const calculateTotal = () => {
    if (!reservation || !reservation.reservationLines) return 0
    return reservation.reservationLines.reduce(
      (total, line) => total + line.quantity * line.unitPrice,
      0
    )
  }

  const handleQuantityChange = async (id: number, change: number) => {
    if (!reservation) return

    const line = reservation.reservationLines.find((l) => l.id === id)
    if (!line) return

    const maxQty = maxQuantities[id] || line.quantity
    const newQuantity = Math.min(Math.max(1, line.quantity + change), maxQty)

    if (newQuantity !== line.quantity) {
      await handleDirectQuantityChange(id, newQuantity.toString())
    }
  }

  const handleDirectQuantityChange = async (id: number, valueStr: string) => {
    try {
      const value = parseInt(valueStr, 10)
      if (isNaN(value)) return

      const line = reservation?.reservationLines.find((l) => l.id === id)
      if (!line) return

      if (value === 0) {
        if (reservation && reservationContext.changeReservationLineQuantity) {
          setReservation({
            ...reservation,
            reservationLines: reservation.reservationLines.filter(
              (l) => l.id !== id
            ),
          })

          await reservationContext.changeReservationLineQuantity(id, 0)

          window.dispatchEvent(
            new CustomEvent('product-quantity-changed', {
              detail: {
                batchId: line.batchId,
                productId: line.productId,
                oldQuantity: line.quantity,
                newQuantity: 0,
                productName: line.productName,
              },
            })
          )

          forceRefresh()
          return
        }
      }

      const maxQty = maxQuantities[id] || line.quantity
      const safeValue = Math.min(Math.max(1, value), maxQty)

      if (reservation) {
        const updatedLines = reservation.reservationLines.map((l) =>
          l.id === id ? { ...l, quantity: safeValue } : l
        )

        setReservation({
          ...reservation,
          reservationLines: updatedLines,
        })

        if (reservationContext.changeReservationLineQuantity) {
          await reservationContext.changeReservationLineQuantity(id, safeValue)

          window.dispatchEvent(
            new CustomEvent('product-quantity-changed', {
              detail: {
                batchId: line.batchId,
                productId: line.productId,
                oldQuantity: line.quantity,
                newQuantity: safeValue,
                productName: line.productName,
              },
            })
          )

          if (safeValue === 0) {
            forceRefresh()
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error)
      setMessage('Impossible de mettre à jour la quantité')
      setOpenSnackbar(true)
      forceRefresh()
    }
  }

  const clearCart = async () => {
    try {
      if (reservation && reservationContext.clearReservation) {
        // Update UI optimistically
        setReservation({
          ...reservation,
          reservationLines: [],
        })

        // Call backend
        await reservationContext.clearReservation(reservation.id)

        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('cart-quantities-updated'))

        setMessage('Votre panier a été vidé')
        setOpenSnackbar(true)
        forceRefresh()
      }
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error)
      setMessage('Impossible de vider le panier')
      setOpenSnackbar(true)
      forceRefresh()
    }
  }

  const handleOpenCalendar = () => {
    if (!authenticatedUser) {
      setMessage('Vous devez vous connecter pour faire une réservation')
      setOpenSnackbar(true)
      setTimeout(() => {
        navigate('/login', { state: { returnTo: '/cart' } })
      }, 2000)
      return
    }
    setOpenCalendar(true)

    // Toujours utiliser la fonction getNextTuesdayOrThursday pour définir la date par défaut
    const nextPickupDate = getNextTuesdayOrThursday()
    setSelectedDate(nextPickupDate)

    // Assurons-nous que la date est considérée comme valide
    setIsDateValid(true)
  }

  const handleCloseCalendar = () => {
    setOpenCalendar(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    setSelectedDate(dateValue)

    const selectedDateObj = new Date(dateValue)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const isAfterTomorrow = selectedDateObj >= tomorrow
    const isTuesdayThursday = isTuesdayOrThursday(dateValue)

    setIsDateValid(isAfterTomorrow && isTuesdayThursday)

    if (!isTuesdayThursday) {
      setMessage('Veuillez sélectionner un mardi ou un jeudi uniquement')
      setOpenSnackbar(true)
    }
  }

  const handleConfirmReservation = async () => {
    if (
      selectedDate &&
      (reservation?.reservationLines?.length ?? 0) > 0 &&
      isDateValid
    ) {
      if (!authenticatedUser) {
        setMessage('Vous devez vous connecter pour faire une réservation')
        setOpenSnackbar(true)
        setTimeout(() => {
          navigate('/login', { state: { returnTo: '/cart' } })
        }, 2000)
        return
      }

      try {
        if (reservation) {
          await reservationContext.toPendingReservation(reservation.id)
        }

        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(selectedDate))

        const confirmationMessage = `Votre réservation pour le ${formattedDate} a été enregistrée avec succès! Vous pouvez la consulter dans "Mes réservations".`

        setOpenCalendar(false)

        navigate('/', {
          state: {
            message: confirmationMessage,
          },
        })
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement de la réservation:",
          error
        )
        setMessage(
          "Une erreur est survenue lors de l'enregistrement de votre réservation. Veuillez réessayer."
        )
        setOpenSnackbar(true)
      }
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
        Mon Panier
      </Typography>

      {!reservation || reservation.reservationLines.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Votre panier est vide
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/')}
          >
            Continuer vos achats
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Produit</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell align="right">Prix unitaire</TableCell>
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservation.reservationLines.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.imageLocation || '/placeholder.jpg'}
                        alt={item.productName}
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">{`${item.unitPrice.toFixed(2)}€`}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleDirectQuantityChange(item.id, e.target.value)
                          }
                          inputProps={{
                            min: 1,
                            style: { textAlign: 'center' },
                          }}
                          sx={{ width: 60, mx: 1 }}
                          size="small"
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          disabled={
                            item.quantity >=
                            (maxQuantities[item.id] || item.quantity)
                          }
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {item.unitType}
                      </Typography>
                      {item.quantity >=
                        (maxQuantities[item.id] || item.quantity) && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ display: 'block', fontSize: '0.7rem' }}
                        >
                          Max
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {`${(item.unitPrice * item.quantity).toFixed(2)}€`}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleDirectQuantityChange(item.id, '0')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              alignItems: 'center',
            }}
          >
            <Box>
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                sx={{ mr: 2 }}
              >
                Vider le panier
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/')}
              >
                Continuer vos achats
              </Button>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                Total: {calculateTotal()?.toFixed(2)}€
              </Typography>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                onClick={handleOpenCalendar}
              >
                Réserver
              </Button>
            </Box>
          </Box>

          <Dialog open={openCalendar} onClose={handleCloseCalendar}>
            <DialogTitle>Choisissez une date de retrait</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Sélectionnez une date pour venir chercher votre commande. Les
                retraits sont disponibles uniquement les mardis et jeudis.
              </DialogContentText>
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <FormControl
                  fullWidth
                  error={!isDateValid && selectedDate !== ''}
                >
                  <TextField
                    id="date"
                    label="Date de retrait (mardi ou jeudi)"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: getTomorrowFormatted(),
                    }}
                    fullWidth
                    margin="normal"
                  />
                  {!isDateValid && selectedDate !== '' && (
                    <FormHelperText>
                      Veuillez choisir un mardi ou un jeudi après la date
                      d'aujourd'hui.
                    </FormHelperText>
                  )}
                </FormControl>

                {selectedDate && isDateValid && (
                  <Typography align="center" sx={{ mt: 2 }}>
                    Date sélectionnée:{' '}
                    {new Date(selectedDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCalendar}>Annuler</Button>
              <Button
                onClick={handleConfirmReservation}
                variant="contained"
                color="success"
                disabled={!isDateValid || !selectedDate}
              >
                Confirmer la réservation
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default CartPage
