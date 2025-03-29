import { useState, useEffect, useContext } from 'react'
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material'
import { UserContext } from '../../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import FilterListIcon from '@mui/icons-material/FilterList'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Type pour les lots de produits
interface ProductBatch {
  id: number
  productName: string
  productType: string
  imageUrl: string
  availabilityDate: string
  availableQuantity: number
  initialQuantity: number
  unitPrice: number
  unitType: string
  producerId: number
  producerName: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

const ManagerDashboardPage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([])
  const [filteredBatches, setFilteredBatches] = useState<ProductBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un manager
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Manager') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  // Récupérer tous les lots
  useEffect(() => {
    const fetchAllBatches = async () => {
      if (!authenticatedUser || authenticatedUser.role !== 'Manager') return

      setLoading(true)
      try {
        // Récupérer les lots stockés dans localStorage
        const savedBatches = localStorage.getItem('producerBatches')

        // Données par défaut/simulées si aucun lot n'est enregistré
        let batchData: ProductBatch[] = []

        if (savedBatches) {
          // Si des lots ont été enregistrés, les utiliser et ajouter le statut
          const parsedBatches = JSON.parse(savedBatches)
          batchData = parsedBatches.map((batch: any) => ({
            ...batch,
            // Ajouter un statut aléatoire pour la démo si non présent
            status:
              batch.status ||
              (Math.random() > 0.7
                ? 'approved'
                : Math.random() > 0.5
                  ? 'rejected'
                  : 'pending'),
            // Ajouter un nom de producteur aléatoire si non présent
            producerName:
              batch.producerName ||
              `Producteur ${Math.floor(Math.random() * 5) + 1}`,
            // Ajouter une raison de rejet si le statut est rejeté et qu'il n'y a pas de raison
            rejectionReason:
              batch.status === 'rejected' && !batch.rejectionReason
                ? 'Non conforme aux standards de qualité'
                : batch.rejectionReason,
          }))
        } else {
          // Données simulées pour l'exemple (première visite)
          batchData = [
            {
              id: 1,
              productName: 'Tomates biologiques',
              productType: 'Légume',
              imageUrl:
                'https://images.unsplash.com/photo-1546054454-aa26e2b734c7',
              availabilityDate: new Date(
                Date.now() + 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              availableQuantity: 25,
              initialQuantity: 30,
              unitPrice: 3.5,
              unitType: 'kg',
              producerId: 101,
              producerName: 'Ferme des Oliviers',
              createdAt: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'pending',
            },
            {
              id: 2,
              productName: 'Pommes Golden',
              productType: 'Fruit',
              imageUrl:
                'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce',
              availabilityDate: new Date(
                Date.now() + 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
              availableQuantity: 15,
              initialQuantity: 20,
              unitPrice: 2.8,
              unitType: 'kg',
              producerId: 102,
              producerName: 'Vergers du Sud',
              createdAt: new Date(
                Date.now() - 4 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'approved',
            },
            {
              id: 3,
              productName: 'Pain au levain',
              productType: 'Boulangerie',
              imageUrl:
                'https://images.unsplash.com/photo-1586444248902-2f64eddc13df',
              availabilityDate: new Date(
                Date.now() + 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              availableQuantity: 8,
              initialQuantity: 10,
              unitPrice: 4.2,
              unitType: 'pièce',
              producerId: 103,
              producerName: 'Boulangerie Artisanale',
              createdAt: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'rejected',
              rejectionReason: 'Photos non conformes, description insuffisante',
            },
            {
              id: 4,
              productName: 'Fromage de chèvre',
              productType: 'Produit laitier',
              imageUrl:
                'https://images.unsplash.com/photo-1452195100486-9cc805987862',
              availabilityDate: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              availableQuantity: 12,
              initialQuantity: 12,
              unitPrice: 5.5,
              unitType: 'pièce',
              producerId: 104,
              producerName: 'Chèvrerie des Alpes',
              createdAt: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'pending',
            },
            {
              id: 5,
              productName: 'Miel de lavande',
              productType: 'Autre',
              imageUrl:
                'https://images.unsplash.com/photo-1587049352851-8d4b89133611',
              availabilityDate: new Date(
                Date.now() + 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              availableQuantity: 18,
              initialQuantity: 20,
              unitPrice: 8.9,
              unitType: 'pot',
              producerId: 105,
              producerName: 'Apiculteur Provençal',
              createdAt: new Date(
                Date.now() - 5 * 24 * 60 * 60 * 1000
              ).toISOString(),
              status: 'approved',
            },
          ]

          // Sauvegarder les données simulées dans localStorage pour les futures visites
          localStorage.setItem('producerBatches', JSON.stringify(batchData))
        }

        setProductBatches(batchData)
        updateFilteredBatches(batchData, tabValue)
      } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err)
        setError(
          'Impossible de récupérer les lots. Veuillez réessayer plus tard.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAllBatches()
  }, [authenticatedUser])

  // Filtrer les lots en fonction de l'onglet sélectionné
  const updateFilteredBatches = (batches: ProductBatch[], tab: number) => {
    switch (tab) {
      case 0: // Tous les lots
        setFilteredBatches(batches)
        break
      case 1: // En attente
        setFilteredBatches(
          batches.filter((batch) => batch.status === 'pending')
        )
        break
      case 2: // Approuvés
        setFilteredBatches(
          batches.filter((batch) => batch.status === 'approved')
        )
        break
      case 3: // Refusés
        setFilteredBatches(
          batches.filter((batch) => batch.status === 'rejected')
        )
        break
      default:
        setFilteredBatches(batches)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    updateFilteredBatches(productBatches, newValue)
  }

  const handleApprove = (batchId: number) => {
    const updatedBatches = productBatches.map((batch) =>
      batch.id === batchId ? { ...batch, status: 'approved' as const } : batch
    )
    setProductBatches(updatedBatches)
    updateFilteredBatches(updatedBatches, tabValue)
    localStorage.setItem('producerBatches', JSON.stringify(updatedBatches))
  }

  const handleRejectClick = (batchId: number) => {
    setCurrentBatchId(batchId)
    setRejectionReason('')
    setOpenDialog(true)
  }

  const handleRejectConfirm = () => {
    if (currentBatchId === null) return

    const updatedBatches = productBatches.map((batch) =>
      batch.id === currentBatchId
        ? { ...batch, status: 'rejected' as const, rejectionReason }
        : batch
    )
    setProductBatches(updatedBatches)
    updateFilteredBatches(updatedBatches, tabValue)
    localStorage.setItem('producerBatches', JSON.stringify(updatedBatches))
    setOpenDialog(false)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  // Si l'utilisateur n'est pas connecté ou n'est pas un manager, ne pas rendre la page
  if (!authenticatedUser || authenticatedUser.role !== 'Manager') {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord gestionnaire
      </Typography>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
          aria-label="filtres de statut"
        >
          <Tab icon={<FilterListIcon />} label="Tous" />
          <Tab
            label={`En attente (${productBatches.filter((b) => b.status === 'pending').length})`}
          />
          <Tab
            label={`Approuvés (${productBatches.filter((b) => b.status === 'approved').length})`}
          />
          <Tab
            label={`Refusés (${productBatches.filter((b) => b.status === 'rejected').length})`}
          />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredBatches.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Aucun lot à afficher dans cette catégorie
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBatches.map((batch) => (
            <Grid item xs={12} md={6} key={batch.id}>
              <Card
                elevation={3}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  height: '100%',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 200, sm: 'auto' },
                    objectFit: 'cover',
                  }}
                  image={batch.imageUrl}
                  alt={batch.productName}
                />
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        mb: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6" component="h3" gutterBottom>
                        {batch.productName}
                      </Typography>
                      {batch.status === 'pending' ? (
                        <Chip label="En attente" color="warning" size="small" />
                      ) : batch.status === 'approved' ? (
                        <Chip label="Approuvé" color="success" size="small" />
                      ) : (
                        <Chip label="Refusé" color="error" size="small" />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Producteur:</strong> {batch.producerName}
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={batch.productType}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Prix:</strong> {batch.unitPrice.toFixed(2)}€/
                        {batch.unitType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Quantité:</strong> {batch.availableQuantity}/
                        {batch.initialQuantity} {batch.unitType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Disponible le:</strong>{' '}
                        {format(
                          new Date(batch.availabilityDate),
                          'dd MMMM yyyy',
                          { locale: fr }
                        )}
                      </Typography>
                    </Box>

                    {batch.status === 'rejected' && batch.rejectionReason && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1,
                          bgcolor: 'error.light',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="caption" color="error.dark">
                          <strong>Motif du refus:</strong>{' '}
                          {batch.rejectionReason}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <Box sx={{ mt: 'auto' }}>
                    <Divider />

                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        Ajouté le{' '}
                        {format(new Date(batch.createdAt), 'dd/MM/yyyy', {
                          locale: fr,
                        })}
                      </Typography>

                      {batch.status === 'pending' && (
                        <Box>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApprove(batch.id)}
                            sx={{ mr: 1 }}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleRejectClick(batch.id)}
                          >
                            Refuser
                          </Button>
                        </Box>
                      )}
                    </CardActions>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Boîte de dialogue pour motif de refus */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Motif du refus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez indiquer la raison pour laquelle ce lot est refusé. Cette
            information sera visible par le producteur.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Motif du refus"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleRejectConfirm}
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ManagerDashboardPage
