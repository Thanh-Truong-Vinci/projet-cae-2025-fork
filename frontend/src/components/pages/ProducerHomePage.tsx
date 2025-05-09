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
  Modal,
  TextField,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material'
import { UserContext } from '../../contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BatchContext } from '../../contexts/BatchContext'
import { PhotoContext } from '../../contexts/PhotoContext'
import { Batch, Photo } from '../../types'

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
      id={`batch-tabpanel-${index}`}
      aria-labelledby={`batch-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `batch-tab-${index}`,
    'aria-controls': `batch-tabpanel-${index}`,
  }
}

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
  const { authenticatedUser } = useContext(UserContext)
  const {
    photos,
    isLoading: isLoadingPhotos,
    fetchAllPhotos,
    error: photoError,
  } = useContext(PhotoContext)!
  const [error, setError] = useState<string | null>(null)

  const [tabValue, setTabValue] = useState(0)

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [photosLoaded, setPhotosLoaded] = useState(false)

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
  }, [authenticatedUser, fetchMyBatches])

  // Load photos only once when the component mounts
  useEffect(() => {
    if (!photosLoaded) {
      fetchAllPhotos()
        .then(() => setPhotosLoaded(true))
        .catch((err) => {
          console.error('Erreur lors de la récupération des photos:', err)
        })
    }
  }, [fetchAllPhotos, photosLoaded])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddBatch = () => {
    navigate('/add-batch')
  }

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch)
    setSelectedImage(null)
    setUploadedImage(null)
    setSearchQuery('')
    setIsImageModalOpen(true)

    if (!photosLoaded) {
      fetchAllPhotos()
        .then(() => setPhotosLoaded(true))
        .catch((err) => {
          console.error('Erreur lors de la récupération des photos:', err)
        })
    }
  }

  // Handle selecting an image from the gallery
  const handleImageSelect = (photo: Photo) => {
    setSelectedImage(photo)
    setUploadedImage(null)
  }

  // Handle uploading a new image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0])
      setSelectedImage(null)
    }
  }

  // Handle image update submission
  const handleUpdateImage = async () => {
    if (!selectedBatch) return

    setError(null)

    try {
      if (uploadedImage) {
        console.log(
          `Uploading new image: ${uploadedImage.name} (${uploadedImage.size} bytes)`
        )
        await updateBatchImage(selectedBatch.id, uploadedImage)
      } else if (selectedImage) {
        console.log(`Selecting existing image with ID: ${selectedImage.id}`)
        await updateBatchImageById(selectedBatch.id, selectedImage.id)
      }

      setIsImageModalOpen(false)
      await fetchMyBatches()
    } catch (err) {
      console.error('Error updating batch image:', err)
      if (err instanceof Error) {
        setError(`Erreur lors de la mise à jour de l'image: ${err.message}`)
      } else {
        setError("Erreur inconnue lors de la mise à jour de l'image")
      }
    }
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
      case 'PENDING':
        return { label: 'En attente', color: 'warning' as const }
      case 'REJECTED':
        return { label: 'Refusé', color: 'error' as const }
      case 'APPROVED':
        return { label: 'Accepté', color: 'success' as const }
      case 'RECEIVED':
        return { label: 'Reçu', color: 'info' as const }
      default:
        return { label: 'Indéterminé', color: 'default' as const }
    }
  }

  // Image Edit Modal Component
  const ImageEditModal = () => {
    const [modalSearchQuery, setModalSearchQuery] = useState(searchQuery)
    const modalFilteredPhotos = photos.filter((photo) =>
      photo.productName.toLowerCase().includes(modalSearchQuery.toLowerCase())
    )

    return (
      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        aria-labelledby="image-edit-modal"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            p: 4,
            outline: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" id="image-edit-modal">
              Changer l'image du lot: {selectedBatch?.productName}
            </Typography>
            <IconButton onClick={() => setIsImageModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Image actuelle:</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <img
                src={selectedBatch?.imageUrl}
                alt={selectedBatch?.productName}
                style={{ maxHeight: '200px', objectFit: 'contain' }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label="Rechercher une image"
              fullWidth
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />,
              }}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Images disponibles:
            </Typography>

            {isLoadingPhotos ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid
                container
                spacing={2}
                sx={{ maxHeight: '300px', overflow: 'auto' }}
              >
                {modalFilteredPhotos.map((photo) => (
                  <Grid item xs={6} sm={4} md={3} key={photo.id}>
                    <Card
                      onClick={() => handleImageSelect(photo)}
                      sx={{
                        cursor: 'pointer',
                        border:
                          selectedImage?.id === photo.id
                            ? '2px solid #1976d2'
                            : 'none',
                        transition: '0.3s',
                        '&:hover': { transform: 'scale(1.03)' },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="100"
                        image={photo.imageLocation}
                        alt={photo.productName}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <Typography variant="caption" noWrap>
                          {photo.productName}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {modalFilteredPhotos.length === 0 && (
                  <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune image ne correspond à votre recherche
                    </Typography>
                  </Box>
                )}
              </Grid>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ mb: 1 }}
            >
              Télécharger une image personnalisée
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {uploadedImage && (
              <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center' }}
              >
                Fichier sélectionné: {uploadedImage.name}
              </Typography>
            )}
          </Box>

          <Box
            sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}
          >
            <Button
              onClick={() => setIsImageModalOpen(false)}
              variant="outlined"
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateImage}
              disabled={!selectedImage && !uploadedImage}
            >
              Confirmer
            </Button>
          </Box>
        </Paper>
      </Modal>
    )
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

      {(error || batchError || photoError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || batchError || photoError}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Vos lots de produits
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="batch status tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Tous" {...a11yProps(0)} />
            <Tab label="En attente" {...a11yProps(1)} />
            <Tab label="Refusé" {...a11yProps(2)} />
            <Tab label="Accepté" {...a11yProps(3)} />
            <Tab label="Reçu" {...a11yProps(4)} />
            <Tab label="Épuisé" {...a11yProps(5)} />
          </Tabs>
        </Box>

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
          <>
            {[0, 1, 2, 3, 4, 5].map((tabIndex) => {
              // Filtrer les lots pour chaque tabIndex
              const tabFilteredBatches = myBatches.filter((batch) => {
                const status = batch.status?.toUpperCase()
                const isOutOfStock = batch.availableQuantity === 0

                switch (tabIndex) {
                  case 0:
                    return true // Tous
                  case 1:
                    return status === 'PENDING'
                  case 2:
                    return status === 'REJECTED'
                  case 3:
                    return status === 'APPROVED' && !isOutOfStock
                  case 4:
                    return status === 'RECEIVED'
                  case 5:
                    return isOutOfStock
                  default:
                    return true
                }
              })

              return (
                <TabPanel key={tabIndex} value={tabValue} index={tabIndex}>
                  {tabFilteredBatches.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="textSecondary">
                        Aucun lot dans cette catégorie.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {tabFilteredBatches.map((batch) => {
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
                                  <Typography
                                    variant="h6"
                                    component="h3"
                                    gutterBottom
                                  >
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
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Disponible:</strong>{' '}
                                    {format(
                                      new Date(batch.availabilityDate),
                                      'dd MMMM yyyy',
                                      { locale: fr }
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Quantité:</strong>{' '}
                                    {batch.availableQuantity} {batch.unitType}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    <strong>Prix:</strong>{' '}
                                    {batch.unitPrice.toFixed(2)}€/
                                    {batch.unitType}
                                  </Typography>
                                </Box>

                                {batch.status === 'REJECTED' &&
                                  batch.rejectionReason && (
                                    <Box
                                      sx={{
                                        mt: 2,
                                        p: 1,
                                        bgcolor: 'error.light',
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="error.dark"
                                      >
                                        <strong>Motif du refus:</strong>{' '}
                                        {batch.rejectionReason}
                                      </Typography>
                                    </Box>
                                  )}

                                <Box sx={{ mt: 2 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Ajouté le{' '}
                                    {format(
                                      new Date(batch.createdAt),
                                      'dd/MM/yyyy',
                                      {
                                        locale: fr,
                                      }
                                    )}
                                  </Typography>
                                </Box>
                              </CardContent>

                              <Divider />

                              <CardActions
                                sx={{ justifyContent: 'center', p: 1 }}
                              >
                                {/* Ne montrer le bouton de modification que si le lot n'est pas refusé */}
                                {batch.status !== 'REJECTED' && (
                                  <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleEditBatch(batch)}
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
                </TabPanel>
              )
            })}
          </>
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
              <Typography variant="body1">Lots acceptés</Typography>
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

      {/* Render the image edit modal */}
      <ImageEditModal />
    </Container>
  )
}

export default ProducerHomePage
