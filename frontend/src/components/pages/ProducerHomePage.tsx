import React, { useContext, useState, useEffect } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@mui/material'
import { UserContext } from '../../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BatchContext } from '../../contexts/BatchContext'
import { PhotoContext } from '../../contexts/PhotoContext'

const ProducerHomePage = () => {
  const navigate = useNavigate()
  const {
    fetchMyBatches,
    myBatches,
    isLoading,
    error: batchError,
    updateBatchImage,
    updateBatchImageById,
  } = useContext(BatchContext)!
  const { photos, isLoading: photosLoading } = useContext(PhotoContext) || { photos: [] }
  const { authenticatedUser } = useContext(UserContext)
  const [error, setError] = useState<string | null>(null)
  const [editingBatchId, setEditingBatchId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Get the batch currently being edited
  const editingBatch = myBatches?.find(batch => batch.id === editingBatchId)

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
      case 'RECEIVED':
        return { label: 'Reçu', color: 'info' as const }
      default:
        return { label: 'Indéterminé', color: 'default' as const }
    }
  }

  // Handler for opening the edit dialog
  const handleOpenEditDialog = (batchId: number) => {
    setEditingBatchId(batchId)
    setSelectedImageId(null)
    setNewImage(null)
    setImagePreview(null)
    setSearchTerm('')
  }

  // Handler for closing the edit dialog
  const handleCloseEditDialog = () => {
    setEditingBatchId(null)
  }

  // Handler for file input changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setNewImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Clear selected image ID if any
      setSelectedImageId(null)
    }
  }

  // Handler for image selection from existing photos
  const handleSelectImage = (photoId: number) => {
    setSelectedImageId(photoId)
    setNewImage(null)
    setImagePreview(null)
  }

  // Handler for saving changes
  const handleSaveImage = async () => {
    if (!editingBatchId) return

    try {
      if (selectedImageId && updateBatchImageById) {
        // If user selected an existing image
        await updateBatchImageById(editingBatchId, selectedImageId)
      } else if (newImage && updateBatchImage) {
        // If user uploaded a new image
        await updateBatchImage(editingBatchId, newImage)
      }
      handleCloseEditDialog()
    } catch (error) {
      console.error('Error updating image:', error)
      // You might want to show an error message to the user here
    }
  }

  // Filter photos based on search term
  const filteredPhotos = photos?.filter(photo =>
    photo.imageLocation.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                          onClick={() => handleOpenEditDialog(batch.id)}
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

      {/* Image Edit Dialog */}
      <Dialog open={editingBatchId !== null} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Modifier l'image
          <IconButton
            aria-label="close"
            onClick={handleCloseEditDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editingBatch && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Image actuelle
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <img 
                    src={editingBatch.imageUrl} 
                    alt={editingBatch.productName}
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Ajouter une nouvelle image
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Choisir un fichier
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Aperçu:
                    </Typography>
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Sélectionner une image existante
                </Typography>
                
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher une image..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                {photosLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : (
                  <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
                    {filteredPhotos && filteredPhotos.length > 0 ? (
                      filteredPhotos.map((photo) => (
                        <ListItem 
                          key={photo.id}
                          button
                          selected={selectedImageId === photo.id}
                          onClick={() => handleSelectImage(photo.id)}
                          sx={{ 
                            border: selectedImageId === photo.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            mb: 1,
                            borderRadius: 1 
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar 
                              variant="square" 
                              src={photo.imageLocation}
                              sx={{ width: 60, height: 60 }}
                            />
                          </ListItemAvatar>
                          <ListItemText 
                            primary={photo.productName}
                            secondary={`Image #${photo.id} - ${photo.imageLocation.split('/').pop()}`}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Aucune image trouvée
                      </Typography>
                    )}
                  </List>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button 
            onClick={handleSaveImage} 
            variant="contained" 
            color="primary"
            disabled={!selectedImageId && !newImage}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ProducerHomePage
