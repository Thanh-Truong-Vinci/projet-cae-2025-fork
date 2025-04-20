import { useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import { ReservationStatus, ReservationView } from '../../types'

const CartPage = () => {
  const { authenticatedUser } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [openCalendar, setOpenCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isDateValid, setIsDateValid] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')
  const reservationContext = useContext(ReservationContext)
  const [reservation, setReservation] = useState<ReservationView | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState('')

  useEffect(() => {
    let isMounted = true

    if (reservationContext && reservationContext.fetchReservations) {
      setIsLoading(true)
      console.log('Chargement du panier en cours...')

      reservationContext
        .fetchReservations()
        .then((r) => {
          if (!isMounted) return
          const buildingReservation = r.find(
            (res) => res.status === ReservationStatus.BUILDING
          )
          setReservation(buildingReservation ?? null)
          console.log('Panier chargé avec succès')
        })
        .catch((err) => {
          console.error('Erreur de chargement du panier:', err)
          setMessage('Erreur lors du chargement de votre panier')
          setOpenSnackbar(true)
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    }

    return () => {
      isMounted = false
    }
  }, [reservationContext, location.key])

  if (!reservationContext) {
    throw new Error(
      'ReservationContext must be used within a ReservationProvider'
    )
  }

  // Calcul de la date minimale (demain)
  const getTomorrowFormatted = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0] // Format YYYY-MM-DD
  }

  // Nouvelle fonction pour vérifier si une date est un mardi ou jeudi
  const isTuesdayOrThursday = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDay() // 0 = dimanche, 1 = lundi, 2 = mardi, etc.
    return day === 2 || day === 4 // 2 = mardi, 4 = jeudi
  }

  // Nouvelle fonction pour trouver le prochain mardi ou jeudi à partir d'aujourd'hui
  const getNextTuesdayOrThursday = () => {
    const date = new Date()
    date.setDate(date.getDate() + 1) // On commence à demain

    // Cherche jusqu'à trouver un mardi ou jeudi
    while (date.getDay() !== 2 && date.getDay() !== 4) {
      date.setDate(date.getDate() + 1)
    }

    return date.toISOString().split('T')[0] // Format YYYY-MM-DD
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

    const newQuantity = Math.max(1, line.quantity + change)
    await handleDirectQuantityChange(id, newQuantity.toString())
  }

  const handleDirectQuantityChange = async (id: number, valueStr: string) => {
    try {
      const value = parseInt(valueStr, 10)
      if (isNaN(value) || value < 1) return

      if (isLoading) return

      setIsLoading(true)
      setLoadingAction(`update-${id}`)

      if (reservation && reservationContext.updateReservationLineQuantity) {
        await reservationContext.updateReservationLineQuantity(id, value)

        // Mise à jour optimiste sans recharger toutes les données
        setReservation((prev) => {
          if (!prev) return null
          return {
            ...prev,
            reservationLines: prev.reservationLines.map((line) =>
              line.id === id ? { ...line, quantity: value } : line
            ),
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error)
      setMessage('Impossible de mettre à jour la quantité')
      setOpenSnackbar(true)
    } finally {
      setIsLoading(false)
      setLoadingAction('')
    }
  }

  const clearCart = async () => {
    try {
      if (reservation && reservationContext.clearReservation) {
        await reservationContext.clearReservation(reservation.id)

        // Rafraîchir les données
        const updatedReservations = await reservationContext.fetchReservations()
        const buildingReservation = updatedReservations.find(
          (res) => res.status === ReservationStatus.BUILDING
        )
        setReservation(buildingReservation ?? null)

        // Montrer confirmation
        setMessage('Votre panier a été vidé')
        setOpenSnackbar(true)
      }
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error)
      setMessage('Impossible de vider le panier')
      setOpenSnackbar(true)
    }
  }

  const removeFromCart = async (id: number) => {
    try {
      if (reservation && reservationContext.removeReservationLine) {
        await reservationContext.removeReservationLine(id)

        // Rafraîchir les données de réservation pour mettre à jour l'affichage
        const updatedReservations = await reservationContext.fetchReservations()
        const buildingReservation = updatedReservations.find(
          (res) => res.status === ReservationStatus.BUILDING
        )
        setReservation(buildingReservation ?? null)

        // Montrer confirmation
        setMessage('Produit retiré du panier avec succès')
        setOpenSnackbar(true)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error)
      setMessage('Impossible de supprimer ce produit du panier')
      setOpenSnackbar(true)
    }
  }

  const handleOpenCalendar = () => {
    if (!authenticatedUser) {
      // Display a clear message when user isn't logged in
      setMessage('Vous devez vous connecter pour faire une réservation')
      setOpenSnackbar(true)
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { state: { returnTo: '/cart' } })
      }, 2000)
      return
    }
    setOpenCalendar(true)
    setSelectedDate(getNextTuesdayOrThursday())
    setIsDateValid(true)
  }

  const handleCloseCalendar = () => {
    setOpenCalendar(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    setSelectedDate(dateValue)

    // Vérification que la date est valide (au moins demain ET un mardi ou jeudi)
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
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mon Panier {isLoading && loadingAction === '' && ' (Chargement...)'}
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
                    <TableCell align="right">{item.unitPrice}</TableCell>
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
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {`${(item.unitPrice * item.quantity).toFixed(2)}€`}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.id)}
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

          {/* Dialogue pour la sélection de date */}
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
    </Box>
  )
}

export default CartPage
