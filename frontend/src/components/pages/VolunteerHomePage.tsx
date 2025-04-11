import { useState, useEffect, useContext } from 'react'
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
} from '@mui/material'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DoneIcon from '@mui/icons-material/Done'
import { BatchContext } from '../../contexts/BatchContext'
import { UserContext } from '../../contexts/UserContext'

const VolunteerHomePage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
  const batchContext = useContext(BatchContext)

  if (!batchContext) {
    throw new Error(
      'BatchContext doit être utilisé à l intérieur d un BatchProvider'
    )
  }

  const { approvedBatches, isLoading, error, receiveBatch } = batchContext

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )

  // Redirect if not authenticated or not a volunteer
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Volunteer') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

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

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer la réception</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir marquer ce lot comme reçu? Cette action ne
            peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmReceive}
            color="primary"
            variant="contained"
          >
            Confirmer
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
