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
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import {
  ReservationStatus,
  ReservationView,
  ReservationLineView,
} from '../../types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reservation-tabpanel-${index}`}
      aria-labelledby={`reservation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `reservation-tab-${index}`,
    'aria-controls': `reservation-tabpanel-${index}`,
  }
}

const ReservationsPage = () => {
  const { authenticatedUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('info')
  const [tabValue, setTabValue] = useState(0)

  // Get reservation context
  const reservationContext = useContext(ReservationContext)

  if (!reservationContext) {
    throw new Error(
      'ReservationContext must be used within a ReservationProvider'
    )
  }

  const { reservations, fetchReservations, isLoading, error } =
    reservationContext

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    if (!authenticatedUser) {
      setSnackbarMessage(
        'Vous devez vous connecter pour accéder à vos réservations'
      )
      setSnackbarSeverity('info')
      setOpenSnackbar(true)
      setTimeout(() => {
        navigate('/login', { state: { returnTo: '/reservations' } })
      }, 2000)
      return
    }

    fetchReservations()
  }, [authenticatedUser, fetchReservations, navigate])

  // Function to format dates uniformly
  const formatDate = (dateStr: string): string => {
    return format(new Date(dateStr), 'dd MMMM yyyy', { locale: fr })
  }

  // Function to get appropriate chip color for status
  const getStatusColor = (
    status: ReservationStatus
  ): 'warning' | 'info' | 'success' | 'error' | 'default' => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'warning'
      case ReservationStatus.CONFIRMED:
        return 'success'
      case ReservationStatus.CANCELLED:
        return 'error'
      case ReservationStatus.ABANDONED:
        return 'error'
      default:
        return 'default'
    }
  }

  // Function to get status display text
  const getStatusDisplay = (status: ReservationStatus): string => {
    switch (status) {
      case ReservationStatus.BUILDING:
        return 'En construction'
      case ReservationStatus.PENDING:
        return 'En attente'
      case ReservationStatus.CONFIRMED:
        return 'Confirmé'
      case ReservationStatus.CANCELLED:
        return 'Annulé'
      case ReservationStatus.ABANDONED:
        return 'Abandonné'
      default:
        return 'Inconnu'
    }
  }

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // Calculate total price of a reservation line
  const calculateLineTotal = (unitPrice: number, quantity: number): string => {
    return (unitPrice * quantity).toFixed(2) + '€'
  }

  // Calculate total price for a reservation
  const calculateReservationTotal = (reservation: ReservationView): string => {
    // Si le prix est déjà défini et est un nombre, l'utiliser
    if (typeof reservation.price === 'number' && reservation.price > 0) {
      return reservation.price.toFixed(2) + '€'
    }

    // Sinon, calculer le prix total à partir des lignes de réservation
    const total = reservation.reservationLines.reduce(
      (sum: number, line: ReservationLineView) =>
        sum + line.unitPrice * line.quantity,
      0
    )
    return total.toFixed(2) + '€'
  }

  // Ajouter une nouvelle row "Total" au tableau des lignes de réservation
  const renderTotalRow = (reservation: ReservationView) => {
    const totalAmount = reservation.reservationLines.reduce(
      (sum: number, line: ReservationLineView) =>
        sum + line.unitPrice * line.quantity,
      0
    )
    return (
      <TableRow sx={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
        <TableCell colSpan={3} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
          Total
        </TableCell>
        <TableCell align="center">
          {reservation.reservationLines.reduce(
            (sum: number, line: ReservationLineView) => sum + line.quantity,
            0
          )}
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
          {totalAmount.toFixed(2)}€
        </TableCell>
      </TableRow>
    )
  }

  // Filter reservations by status
  const pendingReservations = reservations.filter(
    (res) => res.status === ReservationStatus.PENDING
  )

  const confirmedReservations = reservations.filter(
    (res) => res.status === ReservationStatus.CONFIRMED
  )

  const cancelledReservations = reservations.filter(
    (res) => res.status === ReservationStatus.CANCELLED
  )

  const abandonedReservations = reservations.filter(
    (res) => res.status === ReservationStatus.ABANDONED
  )

  // Create reservation list component to avoid code duplication
  const renderReservationList = (reservationList: ReservationView[]) => (
    <>
      {reservationList.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Aucune réservation dans cette catégorie
          </Typography>
        </Box>
      ) : (
        reservationList.map((reservation) => (
          <Accordion
            key={reservation.id}
            sx={{
              mb: 2,
              opacity:
                reservation.status === ReservationStatus.CANCELLED ? 0.8 : 1,
            }}
          >
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
                  Réservation #{reservation.id} -
                  {reservation.saleDate
                    ? ` Retiré le ${formatDate(reservation.saleDate)}`
                    : ` Prévu le ${formatDate(reservation.reservationDate)}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    Total: {calculateReservationTotal(reservation)}
                  </Typography>
                  <Chip
                    label={getStatusDisplay(reservation.status)}
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
                    {reservation.reservationLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <img
                            src={line.imageLocation || '/placeholder.jpg'}
                            alt={line.productName}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                        </TableCell>
                        <TableCell>{line.productName}</TableCell>
                        <TableCell align="right">
                          {line.unitPrice.toFixed(2)}€
                        </TableCell>
                        <TableCell align="center">
                          {line.quantity}
                          {line.unitType}
                        </TableCell>
                        <TableCell align="right">
                          {calculateLineTotal(line.unitPrice, line.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Ajout de la ligne totale */}
                    {renderTotalRow(reservation)}
                  </TableBody>
                </Table>
              </TableContainer>
              {reservation.status === ReservationStatus.PENDING && (
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => {
                      reservationContext
                        .cancelReservation(reservation.id)
                        .then(() => {
                          setSnackbarMessage('Réservation annulée avec succès')
                          setSnackbarSeverity('success')
                          setOpenSnackbar(true)
                        })
                        .catch(() => {
                          setSnackbarMessage(
                            "Erreur lors de l'annulation de la réservation"
                          )
                          setSnackbarSeverity('error')
                          setOpenSnackbar(true)
                        })
                    }}
                  >
                    Annuler
                  </Button>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </>
  )

  if (isLoading) {
    return (
      <Box
        sx={{ width: '100%', p: 3, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }} data-testid="reservations-page">
        Mes Réservations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && reservations.length === 0 ? (
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="reservation tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="En attente" {...a11yProps(0)} />
              <Tab
                label="Récupérées"
                {...a11yProps(1)}
                sx={{
                  color: confirmedReservations.length
                    ? 'success.main'
                    : 'inherit',
                }}
              />
              <Tab
                label="Annulées"
                {...a11yProps(2)}
                sx={{
                  color: cancelledReservations.length
                    ? 'error.main'
                    : 'inherit',
                }}
              />
              <Tab
                label="Abandonnées"
                {...a11yProps(3)}
                sx={{
                  color: abandonedReservations.length
                    ? 'error.main'
                    : 'inherit',
                }}
              />
            </Tabs>
          </Box>

          {/* Pending Reservations Tab */}
          <TabPanel value={tabValue} index={0}>
            {renderReservationList(pendingReservations)}
          </TabPanel>

          {/* Confirmed Reservations Tab */}
          <TabPanel value={tabValue} index={1}>
            {renderReservationList(confirmedReservations)}
          </TabPanel>

          {/* Cancelled Reservations Tab */}
          <TabPanel value={tabValue} index={2}>
            {renderReservationList(cancelledReservations)}
          </TabPanel>

          {/* Abandoned Reservations Tab */}
          <TabPanel value={tabValue} index={3}>
            {renderReservationList(abandonedReservations)}
          </TabPanel>
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
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ReservationsPage
