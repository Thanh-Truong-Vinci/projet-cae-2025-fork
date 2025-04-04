import { useContext, useState } from 'react'
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
import { CartContext } from '../../contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } =
    useContext(CartContext)
  const { authenticatedUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [openCalendar, setOpenCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isDateValid, setIsDateValid] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')

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
    return cartItems.reduce(
      (total, item) =>
        total + Number(item.price.replace('€', '')) * item.quantity,
      0
    )
  }

  const handleQuantityChange = (id: number, change: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change)
      updateQuantity(id, newQuantity)
    }
  }

  const handleDirectQuantityChange = (id: number, value: string) => {
    const quantity = parseInt(value)
    if (quantity > 0) {
      updateQuantity(id, quantity)
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

  const handleConfirmReservation = () => {
    if (selectedDate && cartItems.length > 0 && isDateValid) {
      if (!authenticatedUser) {
        setMessage('Vous devez vous connecter pour faire une réservation')
        setOpenSnackbar(true)
        setTimeout(() => {
          navigate('/login', { state: { returnTo: '/cart' } })
        }, 2000)
        return
      }

      // Journalisation détaillée de l'utilisateur et de son ID
      console.log('Utilisateur authentifié:', JSON.stringify(authenticatedUser))

      // Extraire l'ID utilisateur en mode débogage
      let userId
      if ('id' in authenticatedUser) {
        userId = authenticatedUser.id
        console.log(
          'ID trouvé depuis la propriété "id":',
          userId,
          'type:',
          typeof userId
        )
      } else if ('userId' in authenticatedUser) {
        // Remplacer (authenticatedUser as any).userId par une méthode plus typée
        userId = (authenticatedUser as Record<string, unknown>).userId as
          | number
          | string
        console.log(
          'ID trouvé depuis la propriété "userId":',
          userId,
          'type:',
          typeof userId
        )
      } else {
        // Parcourir toutes les propriétés pour trouver un ID potentiel
        const keys = Object.keys(authenticatedUser)
        console.log("Propriétés disponibles dans l'utilisateur:", keys)

        // Chercher une propriété qui ressemble à un ID
        for (const key of keys) {
          if (key.toLowerCase().includes('id')) {
            // Remplacer (authenticatedUser as any)[key] par une méthode plus typée
            userId = (authenticatedUser as unknown as Record<string, unknown>)[
              key
            ] as number | string
            console.log(
              `ID potentiel trouvé dans la propriété "${key}":`,
              userId
            )
            break
          }
        }

        if (!userId) {
          userId = Date.now() // Fallback si aucun ID n'est trouvé
          console.log(
            "Aucun ID trouvé, utilisation d'un ID temporaire:",
            userId
          )
        }
      }

      // Convertir explicitement en nombre pour s'assurer de la cohérence
      userId = Number(userId)
      console.log('ID utilisateur final utilisé pour la réservation:', userId)

      // Création d'une nouvelle réservation avec l'ID utilisateur
      const selectedDateObj = new Date(selectedDate)
      const reservation = {
        id: Date.now(),
        userId: userId,
        date: selectedDateObj,
        items: [...cartItems],
        total: calculateTotal(),
        status: 'En attente',
      }

      console.log('Nouvelle réservation créée:', JSON.stringify(reservation))

      try {
        // Récupération des réservations existantes
        const existingReservations = JSON.parse(
          localStorage.getItem('userReservations') || '[]'
        )

        console.log('Réservations existantes:', existingReservations.length)

        // Ajout de la nouvelle réservation
        const updatedReservations = [...existingReservations, reservation]
        console.log('Réservations mises à jour:', updatedReservations.length)

        // Sauvegarde dans le localStorage
        localStorage.setItem(
          'userReservations',
          JSON.stringify(updatedReservations)
        )

        // Vérifiez immédiatement après
        const test = localStorage.getItem('userReservations')
        console.log(
          'Vérification après sauvegarde:',
          test ? JSON.parse(test).length : 'aucun'
        )

        console.log(
          'Réservation enregistrée avec succès. Vérifiez le localStorage'
        )

        // Vérifier immédiatement que la réservation a bien été enregistrée
        const verifyReservations = JSON.parse(
          localStorage.getItem('userReservations') || '[]'
        )
        console.log(
          'Vérification - nombre de réservations dans localStorage:',
          verifyReservations.length
        )
        console.log(
          'Dernière réservation dans localStorage:',
          verifyReservations.length > 0
            ? JSON.stringify(verifyReservations[verifyReservations.length - 1])
            : 'aucune'
        )

        // Format de date pour l'affichage
        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(selectedDateObj)

        // Message de confirmation amélioré
        const confirmationMessage = `Votre réservation pour le ${formattedDate} a été enregistrée avec succès! Vous pouvez la consulter dans "Mes réservations".`

        // Fermeture du calendrier et vidage du panier
        setOpenCalendar(false)
        clearCart()

        // Redirection vers la page d'accueil avec le message de confirmation
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
        Mon Panier
      </Typography>

      {cartItems.length === 0 ? (
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
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 60, height: 60, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.price}</TableCell>
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
                      {`${(Number(item.price.replace('€', '')) * item.quantity).toFixed(2)}€`}
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
                Total: {calculateTotal().toFixed(2)}€
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
