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
} from '@mui/material'
import { UserContext } from '../../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
// Supprimez l'import de DeleteIcon
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
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
  createdAt: string
  status?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

const ProducerHomePage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas un producteur
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Producer') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  // Récupérer les lots du producteur
  useEffect(() => {
    const fetchProducerBatches = async () => {
      if (!authenticatedUser || authenticatedUser.role !== 'Producer') return

      setLoading(true)
      try {
        // Récupérer les lots stockés dans localStorage
        const savedBatches = localStorage.getItem('producerBatches')

        // Données par défaut/simulées si aucun lot n'est enregistré
        let batchData: ProductBatch[] = []

        if (savedBatches) {
          // Si des lots ont été enregistrés, les utiliser
          batchData = JSON.parse(savedBatches)

          // Ajouter un statut par défaut si non défini
          batchData = batchData.map((batch) => ({
            ...batch,
            status: batch.status || 'approved',
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
              producerId:
                'id' in authenticatedUser ? (authenticatedUser as any).id : 1,
              createdAt: new Date().toISOString(),
              status: 'approved',
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
              producerId:
                'id' in authenticatedUser ? (authenticatedUser as any).id : 1,
              createdAt: new Date().toISOString(),
              status: 'pending',
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
              availableQuantity: 0,
              initialQuantity: 10,
              unitPrice: 4.2,
              unitType: 'pièce',
              producerId:
                'id' in authenticatedUser ? (authenticatedUser as any).id : 1,
              createdAt: new Date().toISOString(),
              status: 'rejected',
              rejectionReason: 'Photos non conformes, description insuffisante',
            },
          ]

          // Sauvegarder les données simulées dans localStorage pour les futures visites
          localStorage.setItem('producerBatches', JSON.stringify(batchData))
        }

        setProductBatches(batchData)
      } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err)
        setError(
          'Impossible de récupérer vos lots. Veuillez réessayer plus tard.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProducerBatches()
  }, [authenticatedUser])

  const handleAddBatch = () => {
    navigate('/add-product')
  }

  const handleEditBatch = (batchId: number) => {
    console.log(`Éditer le lot ${batchId}`)
    // Implémentation future: navigate(`/edit-batch/${batchId}`)
  }

  // Supprimer la fonction handleDeleteBatch car elle n'est plus nécessaire

  // Fonction pour obtenir le libellé et la couleur du statut
  const getStatusLabel = (
    status: string | undefined,
    availableQuantity: number
  ) => {
    if (availableQuantity === 0) {
      return { label: 'Épuisé', color: 'error' as const }
    }

    switch (status) {
      case 'approved':
        return { label: 'En vente', color: 'success' as const }
      case 'pending':
        return { label: 'En attente', color: 'warning' as const }
      case 'rejected':
        return { label: 'Refusé', color: 'error' as const }
      default:
        return { label: 'Indéterminé', color: 'default' as const }
    }
  }

  // Si l'utilisateur n'est pas connecté ou n'est pas un producteur, ne pas rendre la page
  if (!authenticatedUser || authenticatedUser.role !== 'Producer') {
    return null
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de bord producteur
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddBatch}
        >
          Ajouter un lot
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Vos lots de produits
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : productBatches.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Vous n'avez pas encore ajouté de lots de produits.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddBatch}
              sx={{ mt: 2 }}
            >
              Ajouter votre premier lot
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {productBatches.map((batch) => {
              const statusInfo = getStatusLabel(
                batch.status,
                batch.availableQuantity
              )

              return (
                <Grid item xs={12} sm={6} md={4} key={batch.id}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity:
                        batch.status === 'rejected' ||
                        batch.availableQuantity === 0
                          ? 0.7
                          : 1,
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={batch.imageUrl}
                      alt={batch.productName}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Typography variant="h6" component="h3" gutterBottom>
                          {batch.productName}
                        </Typography>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color}
                        />
                      </Box>

                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={batch.productType}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          <strong>Disponible:</strong>{' '}
                          {format(
                            new Date(batch.availabilityDate),
                            'dd MMMM yyyy',
                            { locale: fr }
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Quantité:</strong> {batch.availableQuantity}/
                          {batch.initialQuantity} {batch.unitType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Prix:</strong> {batch.unitPrice.toFixed(2)}€/
                          {batch.unitType}
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

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Ajouté le{' '}
                          {format(new Date(batch.createdAt), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ justifyContent: 'center', p: 1 }}>
                      {/* Ne montrer le bouton de modification que si le lot n'est pas refusé */}
                      {batch.status !== 'rejected' && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditBatch(batch.id)}
                          disabled={batch.availableQuantity === 0}
                        >
                          Modifier
                        </Button>
                      )}
                      {/* Supprimer le bouton de suppression */}
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Statistiques
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {productBatches.length}
              </Typography>
              <Typography variant="body1">Total des lots</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main">
                {
                  productBatches.filter(
                    (batch) =>
                      batch.status === 'approved' && batch.availableQuantity > 0
                  ).length
                }
              </Typography>
              <Typography variant="body1">Lots en vente</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="warning.main">
                {
                  productBatches.filter((batch) => batch.status === 'pending')
                    .length
                }
              </Typography>
              <Typography variant="body1">En attente</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {productBatches.reduce(
                  (sum, batch) =>
                    sum + (batch.initialQuantity - batch.availableQuantity),
                  0
                )}
              </Typography>
              <Typography variant="body1">Unités vendues</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default ProducerHomePage
