import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { UserContext } from '../../contexts/UserContext'

// Types pour les réservations
interface ReservationItem {
  id: number
  name: string
  price: string
  image: string
  quantity: number
  unitType?: string
}

interface Reservation {
  id: number
  userId: number
  date: string | Date
  items: ReservationItem[]
  total: number
  status: string
}

const ReservationsPage = () => {
  const { authenticatedUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')

  // Simplifier la logique de chargement des réservations
  useEffect(() => {
    if (!authenticatedUser) {
      setMessage('Vous devez vous connecter pour accéder à vos réservations')
      setOpenSnackbar(true)
      setTimeout(() => {
        navigate('/login', { state: { returnTo: '/reservations' } })
      }, 2000)
      return
    }

    console.log('Chargement des réservations pour l\'utilisateur:', authenticatedUser);

    try {
      // 1. Solution temporaire : montrer TOUTES les réservations
      // Cela nous permettra de voir si les réservations existent bien
      const storedReservations = localStorage.getItem('userReservations');
      if (!storedReservations) {
        console.log('Aucune réservation dans le localStorage');
        setReservations([]);
        return;
      }

      let allReservations = JSON.parse(storedReservations);
      
      // Pour déboguer, affichez toutes les réservations dans la console
      console.log('Toutes les réservations chargées:', allReservations);

      // Aucun filtrage pour l'instant - montrer toutes les réservations
      const sortedReservations = [...allReservations].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setReservations(sortedReservations);
      
      // Notez que nous affichons toutes les réservations sans filtre pour déboguer
      console.log('Réservations affichées (toutes):', sortedReservations.length);
      
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    }
  }, [authenticatedUser, navigate]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en attente':
        return 'warning'
      case 'confirmé':
        return 'info'
      case 'prêt':
        return 'success'
      case 'annulé':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateStr: string | Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr))
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mes Réservations
      </Typography>

      {reservations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Vous n'avez aucune réservation
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/')}
          >
            Découvrir nos produits
          </Button>
        </Box>
      ) : (
        <Box>
          {reservations.map((reservation) => (
            <Accordion key={reservation.id} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`reservation-${reservation.id}-content`}
                id={`reservation-${reservation.id}-header`}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Réservation du {formatDate(reservation.date)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>
                      {`${reservation.total.toFixed(2)}€`}
                    </Typography>
                    <Chip
                      label={reservation.status}
                      color={getStatusColor(reservation.status)}
                      size="small"
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Produit</TableCell>
                        <TableCell>Nom</TableCell>
                        <TableCell align="right">Prix unitaire</TableCell>
                        <TableCell align="center">Quantité</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservation.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                              }}
                            />
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.price}</TableCell>
                          <TableCell align="center">{item.quantity} {item.unitType || ''}</TableCell>
                          <TableCell align="right">
                            {`${(Number(item.price.replace('€', '')) * item.quantity).toFixed(2)}€`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Numéro de réservation: #{reservation.id}
                  </Typography>
                  {/* Pour le débogage, afficher également le userId */}
                  <Typography variant="body2" color="text.secondary">
                    User ID: {reservation.userId}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
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

export default ReservationsPage
