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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BatchContext } from '../../contexts/BatchContext'

const ProducerHomePage = () => {
  const navigate = useNavigate()
  const {
    fetchMyBatches,
    myBatches,
    isLoading,
    error: batchError,
  } = useContext(BatchContext)!
  const { authenticatedUser } = useContext(UserContext)
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
    if (authenticatedUser?.role === 'Producer') {
      fetchMyBatches().catch((err) => {
        console.error('Erreur lors de la récupération des lots:', err)
        setError(
          'Impossible de récupérer vos lots. Veuillez réessayer plus tard.'
        )
      })
    }
  }, [authenticatedUser, fetchMyBatches]) // Ajout de fetchMyBatches comme dépendance

  const handleAddBatch = () => {
    navigate('/add-batch')
  }

  const handleEditBatch = (batchId: number) => {
    console.log(`Éditer le lot ${batchId}`)
    // Implémentation future: navigate(`/edit-batch/${batchId}`)
  }

  // Fonction pour obtenir le libellé et la couleur du statut
  const getStatusLabel = (
    status: string | undefined,
    availableQuantity: number
  ) => {
    if (availableQuantity === 0) {
      return { label: 'Épuisé', color: 'error' as const }
    }

    // Adaptation aux valeurs de status en majuscules venant de l'API
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return { label: 'En vente', color: 'success' as const }
      case 'PENDING':
        return { label: 'En attente', color: 'warning' as const }
      case 'REJECTED':
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

      {(error || batchError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || batchError}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Vos lots de produits
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : myBatches.length === 0 ? (
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
            {myBatches.map((batch) => {
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
                        batch.status === 'REJECTED' ||
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
                          <strong>Quantité:</strong> {batch.availableQuantity}{' '}
                          {batch.unitType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Prix:</strong> {batch.unitPrice.toFixed(2)}€/
                          {batch.unitType}
                        </Typography>
                      </Box>

                      {batch.status === 'REJECTED' && batch.rejectionReason && (
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
                      {batch.status !== 'REJECTED' && (
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditBatch(batch.id)}
                          disabled={batch.availableQuantity === 0}
                        >
                          Modifier
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Statistiques
        </Typography>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h4" color="primary">
                {myBatches.length}
              </Typography>
              <Typography variant="body1">Total des lots</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h4" color="success.main">
                {
                  myBatches.filter(
                    (batch) =>
                      batch.status === 'APPROVED' && batch.availableQuantity > 0
                  ).length
                }
              </Typography>
              <Typography variant="body1">Lots en vente</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Box
              sx={{
                textAlign: 'center',
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h4" color="warning.main">
                {myBatches.filter((batch) => batch.status === 'PENDING').length}
              </Typography>
              <Typography variant="body1">En attente</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default ProducerHomePage
