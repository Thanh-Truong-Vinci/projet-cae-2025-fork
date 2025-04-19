import {
  useState,
  useEffect,
  useContext,
  ChangeEvent,
  FormEvent,
  useRef,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  Paper,
  Container,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Autocomplete,
  Modal,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Dayjs } from 'dayjs'
import 'dayjs/locale/fr'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import { useContext as useReactContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { BatchContext } from '../../contexts/BatchContext'
import { ProductContext } from '../../contexts/ProductContext'
import { useProductType } from '../../contexts/ProductTypeContext'
import { PhotoContext } from '../../contexts/PhotoContext'
import { NewBatch, Product, Photo } from '../../types'

type ProductType = string

interface FormErrors {
  productName?: string
  productType?: string
  productDescription?: string
  productImage?: string
  availabilityDate?: string
  availableQuantity?: string
  unitPrice?: string
  unitType?: string
}

const AddBatchPage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
  const batchContext = useContext(BatchContext)
  const productContext = useReactContext(ProductContext)
  const { productTypes, loading: loadingTypes } = useProductType()
  const { photos, isLoading: isLoadingPhotos, fetchAllPhotos } = useContext(PhotoContext)!
  const hasLoadedProducts = useRef(false)
  const [photosLoaded, setPhotosLoaded] = useState(false)

  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState<ProductType | ''>('')
  const [productDescription, setProductDescription] = useState('')
  const [productImage, setProductImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [availabilityDate, setAvailabilityDate] = useState<Dayjs | null>(null)
  const [availableQuantity, setAvailableQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [unitType, setUnitType] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )
  const [fieldsLocked, setFieldsLocked] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  )
  
  // Image selection modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null)

  useEffect(() => {
    if (!batchContext) {
      console.error("BatchContext n'est pas disponible")
    }
  }, [batchContext])

  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Producer') {
      setSnackbarMessage(
        'Accès non autorisé. Seuls les producteurs peuvent ajouter des produits.'
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)

      setTimeout(() => {
        navigate('/')
      }, 3000)
    }
  }, [authenticatedUser, navigate])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (productContext && !hasLoadedProducts.current) {
          hasLoadedProducts.current = true
          await productContext.fetchAllProducts()
        }
      } catch (error) {
        console.error('Error loading products:', error)
        setSnackbarMessage('Erreur lors du chargement des produits')
        setSnackbarSeverity('error')
        setOpenSnackbar(true)
      }
    }

    loadProducts()
  }, [productContext])
  
  useEffect(() => {
    if (!photosLoaded) {
      fetchAllPhotos()
        .then(() => setPhotosLoaded(true))
        .catch((err) => {
          console.error('Erreur lors de la récupération des photos:', err)
          setSnackbarMessage('Erreur lors du chargement des images')
          setSnackbarSeverity('error')
          setOpenSnackbar(true)
        })
    }
  }, [fetchAllPhotos, photosLoaded])

  if (!authenticatedUser || authenticatedUser.role !== 'Producer') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    )
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (fieldsLocked) {
      setSnackbarMessage("Changez le nom du produit pour modifier l'image")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const fileExtension = selectedFile.name.split('.').pop() || ''
      const renamedFile = new File([selectedFile], `image.${fileExtension}`, {
        type: selectedFile.type,
      })

      setProductImage(renamedFile)
      setSelectedImage(null)

      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setProductType(event.target.value as ProductType)
  }

  const handleProductSelection = (product: Product | null) => {
    console.log('Selected product:', product)

    if (product) {
      setProductName(product.name)
      setProductDescription(product.description)
      setSelectedProductId(product.id)

      if (product.type && product.type.title) {
        setProductType(product.type.title)
        console.log('Product type set to:', product.type.title)
      } else if (product.productType && product.productType.title) {
        setProductType(product.productType.title)
      }
      if (product.photo && product.photo.imageLocation) {
        const imageUrl = product.photo.imageLocation
        setImagePreview(imageUrl)
        console.log('Image preview set to:', imageUrl)
      } else if (product.image) {
        setImagePreview(product.image)
      }
      setFieldsLocked(true)
    } else {
      setSelectedProductId(null)
      setFieldsLocked(false)
    }
  }

  const handleProductNameChange = (value: string) => {
    setProductName(value)
    if (
      fieldsLocked &&
      productContext &&
      !productContext.allProducts.some((p) => p.name === value)
    ) {
      setFieldsLocked(false)
    }
  }
  
  const handleOpenImageModal = () => {
    if (fieldsLocked) {
      setSnackbarMessage("Changez le nom du produit pour modifier l'image")
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
      return
    }
    
    setIsImageModalOpen(true)
    setSearchQuery('')
    
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
    setProductImage(null)
    setImagePreview(photo.imageLocation)
  }
  
  // Confirm image selection and close modal
  const handleConfirmImageSelection = () => {
    setIsImageModalOpen(false)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!productName.trim())
      newErrors.productName = 'Le nom du produit est requis'

    if (!productType) newErrors.productType = 'Le type de produit est requis'

    if (productDescription && productDescription.length > 500) {
      newErrors.productDescription =
        'La description ne doit pas dépasser 500 caractères'
    }

    if (!fieldsLocked && !productImage && !imagePreview)
      newErrors.productImage = 'Une image est requise'

    if (!availabilityDate)
      newErrors.availabilityDate = 'La date de disponibilité est requise'

    if (!availableQuantity || isNaN(Number(availableQuantity)) || Number(availableQuantity) <= 0)
      newErrors.availableQuantity = 'La quantité doit être un nombre positif'

    if (!unitPrice || isNaN(Number(unitPrice)) || Number(unitPrice) <= 0)
      newErrors.unitPrice = 'Le prix doit être un nombre positif'

    if (!unitType.trim())
      newErrors.unitType = "L'unité de vente est requise"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (!selectedProductId && !productImage && !imagePreview) {
        throw new Error("L'image du produit est requise")
      }

      const batchData: NewBatch = {
        email: authenticatedUser.email,
        productName: productName,
        productType: productType,
        productDescription: productDescription,
        availabilityDate: availabilityDate?.format('YYYY-MM-DD') || '',
        unitPrice: parseFloat(unitPrice),
        saleUnit: unitType,
        availableQuantity: parseInt(availableQuantity),
      }

      if (batchContext) {
        if (selectedProductId) {
          await batchContext.createBatchWithExistingProduct(
            batchData,
            selectedProductId
          )
        } else if (productImage) {
          await batchContext.createBatch(batchData, productImage)
        } else if (selectedImage) {
          const imageData = new FormData()
          imageData.append('batch', new Blob([JSON.stringify(batchData)], { type: 'application/json' }))
          imageData.append('imageId', selectedImage.id.toString())
          const response = await fetch(selectedImage.imageLocation)
          const blob = await response.blob()
          const file = new File([blob], "selected_image.jpg", { type: blob.type })
          await batchContext.createBatch(batchData, file)
        } else {
          throw new Error(
            "Une erreur s'est produite lors de la création du lot"
          )
        }

        setProductName('')
        setProductType('')
        setProductDescription('')
        setProductImage(null)
        setImagePreview(null)
        setAvailabilityDate(null)
        setAvailableQuantity('')
        setUnitPrice('')
        setUnitType('')
        setSelectedProductId(null)
        setSelectedImage(null)

        setSnackbarMessage(
          'Lot ajouté avec succès! Il sera examiné par un gestionnaire.'
        )
        setSnackbarSeverity('success')
        setOpenSnackbar(true)

        setTimeout(() => {
          navigate('/producer-dashboard')
        }, 2000)
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du lot:", error)
      setSnackbarMessage(
        error instanceof Error ? error.message : "Erreur lors de l'ajout du lot"
      )
      setSnackbarSeverity('error')
      setOpenSnackbar(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }
  
  // Image selection modal component
  const ImageSelectionModal = () => {
    const [modalSearchQuery, setModalSearchQuery] = useState(searchQuery);
    const modalFilteredPhotos = photos.filter((photo) =>
      photo.productName.toLowerCase().includes(modalSearchQuery.toLowerCase())
    );
    
    return (
      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        aria-labelledby="image-selection-modal"
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
            <Typography variant="h6" id="image-selection-modal">
              Choisir une image
            </Typography>
            <IconButton onClick={() => setIsImageModalOpen(false)}>
              <CloseIcon />
            </IconButton>
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

          <Box
            sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}
          >
            <Button onClick={() => setIsImageModalOpen(false)} variant="outlined">
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmImageSelection}
              disabled={!selectedImage}
            >
              Confirmer
            </Button>
          </Box>
        </Paper>
      </Modal>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          color="primary"
        >
          Ajouter un nouveau lot
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                id="product-name-autocomplete"
                options={productContext ? productContext.allProducts : []}
                loading={
                  productContext ? productContext.loadingAllProducts : false
                }
                getOptionLabel={(option: Product | string) => {
                  return typeof option === 'string' ? option : option.name
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    fullWidth
                    label="Nom du produit"
                    error={!!errors.productName}
                    helperText={errors.productName}
                  />
                )}
                onChange={(_, value) => {
                  if (value && typeof value !== 'string') {
                    handleProductSelection(value)
                  } else if (typeof value === 'string') {
                    handleProductNameChange(value)
                  } else {
                    handleProductSelection(null)
                  }
                }}
                freeSolo
                onInputChange={(_, value) => handleProductNameChange(value)}
                value={
                  productContext?.allProducts.find(
                    (p) => p.name === productName
                  ) || null
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.productType}>
                <InputLabel id="product-type-label">
                  Type de produit *
                </InputLabel>
                <Select
                  labelId="product-type-label"
                  value={productType}
                  label="Type de produit *"
                  onChange={handleTypeChange}
                  disabled={loadingTypes || fieldsLocked}
                >
                  {loadingTypes ? (
                    <MenuItem disabled>Chargement des types...</MenuItem>
                  ) : (
                    productTypes.map((type) => (
                      <MenuItem key={type.id} value={type.title}>
                        {type.title}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.productType && (
                  <FormHelperText>{errors.productType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description du produit"
                placeholder="Ajoutez une description (max 500 caractères)"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                error={!!errors.productDescription}
                helperText={errors.productDescription}
                multiline
                rows={4}
                disabled={fieldsLocked}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{ border: '1px dashed grey', p: 2, textAlign: 'center' }}
              >
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="product-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="product-image-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      disabled={fieldsLocked}
                    >
                      Télécharger une image
                    </Button>
                  </label>
                  
                  <Button
                    variant="outlined"
                    startIcon={<PhotoLibraryIcon />}
                    onClick={handleOpenImageModal}
                    disabled={fieldsLocked}
                  >
                    Choisir une image existante
                  </Button>
                </Box>

                {imagePreview && (
                  <Box sx={{ mt: 2, maxHeight: '200px', overflow: 'hidden' }}>
                    <img
                      src={imagePreview}
                      alt="Prévisualisation"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                )}

                {errors.productImage && (
                  <FormHelperText error>{errors.productImage}</FormHelperText>
                )}
              </Box>
              {fieldsLocked && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Pour modifier ces champs, changez le nom du produit
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="fr"
              >
                <DatePicker
                  label="Date de disponibilité *"
                  value={availabilityDate}
                  onChange={(newValue) => setAvailabilityDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.availabilityDate,
                      helperText: errors.availabilityDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Quantité disponible"
                type="number"
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(e.target.value)}
                inputProps={{ min: '0', step: '0.01' }}
                error={!!errors.availableQuantity}
                helperText={errors.availableQuantity}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Prix unitaire"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                inputProps={{ min: '0', step: '0.01' }}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Unité de vente"
                placeholder="Ex: kg, pièce, bouquet..."
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                error={!!errors.unitType}
                helperText={errors.unitType}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Ajouter le produit'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
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
      
      {/* Image selection modal */}
      <ImageSelectionModal />
    </Container>
  )
}

export default AddBatchPage
