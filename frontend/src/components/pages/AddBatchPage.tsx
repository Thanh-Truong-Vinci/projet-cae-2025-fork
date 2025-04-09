import { useState, useEffect, useContext, ChangeEvent, FormEvent } from 'react'
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
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { Dayjs } from 'dayjs'
import 'dayjs/locale/fr'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { UserContext } from '../../contexts/UserContext'
import { BatchContext } from '../../contexts/BatchContext'
import { NewBatch } from '../../types'

type ProductType =
  | 'Légumes'
  | 'Fruits'
  | 'Boulangerie'
  | 'Viande'
  | 'Produits laitiers'
  | 'Autre'

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

  // États du formulaire
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

      // Rediriger après un court délai
      setTimeout(() => {
        navigate('/')
      }, 3000)
    }
  }, [authenticatedUser, navigate])

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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setProductImage(selectedFile)

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!productName.trim())
      newErrors.productName = 'Le nom du produit est requis'
    if (!productType) newErrors.productType = 'Le type de produit est requis'
    if (productDescription && productDescription.length > 500) {
      newErrors.productDescription =
        'La description ne doit pas dépasser 500 caractères'
    }
    if (!productImage) newErrors.productImage = 'Une image est requise'
    if (!availabilityDate)
      newErrors.availabilityDate = 'La date de disponibilité est requise'
    if (!availableQuantity.trim())
      newErrors.availableQuantity = 'La quantité disponible est requise'
    else if (
      isNaN(Number(availableQuantity)) ||
      Number(availableQuantity) <= 0
    ) {
      newErrors.availableQuantity = 'La quantité doit être un nombre positif'
    }
    if (!unitPrice.trim()) newErrors.unitPrice = 'Le prix unitaire est requis'
    else if (isNaN(Number(unitPrice)) || Number(unitPrice) <= 0) {
      newErrors.unitPrice = 'Le prix doit être un nombre positif'
    }
    if (!unitType.trim()) newErrors.unitType = "L'unité de vente est requise"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (!productImage) {
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
        await batchContext.createBatch(batchData, productImage)
      } else {
        throw new Error("Le contexte BatchContext n'est pas disponible")
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

      setSnackbarMessage(
        'Lot ajouté avec succès! Il sera examiné par un gestionnaire.'
      )
      setSnackbarSeverity('success')
      setOpenSnackbar(true)

      setTimeout(() => {
        navigate('/producer-dashboard')
      }, 2000)
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
              <TextField
                required
                fullWidth
                label="Nom du produit"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                error={!!errors.productName}
                helperText={errors.productName}
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
                >
                  <MenuItem value="Légumes">Légumes</MenuItem>
                  <MenuItem value="Fruits">Fruits</MenuItem>
                  <MenuItem value="Boulangerie">Boulangerie</MenuItem>
                  <MenuItem value="Viande">Viande</MenuItem>
                  <MenuItem value="Produits laitiers">
                    Produits laitiers
                  </MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
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
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{ border: '1px dashed grey', p: 2, textAlign: 'center' }}
              >
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
                  >
                    Télécharger une image
                  </Button>
                </label>

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
    </Container>
  )
}

export default AddBatchPage
