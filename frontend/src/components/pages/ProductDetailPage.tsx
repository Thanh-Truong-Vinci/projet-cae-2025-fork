import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  IconButton,
  CardMedia,
  Divider,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ProductBatch } from '../../types'
import { ProductContext } from '../../contexts/ProductContext'
import { ReservationContext } from '../../contexts/ReservationContext'

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { getProductById } = useContext(ProductContext)!
  const { createReservation } = useContext(ReservationContext)!
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<ProductBatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProduct = () => {
      try {
        setLoading(true)

        if (location.state?.product) {
          setProduct(location.state.product)
          return
        }

        if (productId) {
          const foundProduct = getProductById(parseInt(productId))
          if (foundProduct) {
            setProduct(foundProduct)
          } else {
            setError('Produit non trouvé')
          }
        } else {
          setError('ID de produit invalide')
        }
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err)
        setError('Impossible de charger les détails du produit')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId, location.state, getProductById])

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => {
      if (!product) return prev
      return Math.min(product.totalQuantity, Math.max(1, prev + change))
    })
  }

  const handleAddToReservation = () => {
    if (product) {
      createReservation(product.batchIds[0], quantity)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !product) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 5,
        }}
      >
        <Typography variant="h6" color="error">
          {error || 'Produit non trouvé'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Retour à l'accueil
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Fil d'Ariane */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/')}
        >
          Accueil
        </Link>
        <Typography color="text.primary">{product.productName}</Typography>
      </Breadcrumbs>

      {/* Bouton Retour */}
      <Button
        startIcon={<ArrowBackIcon />}
        variant="text"
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Retour aux produits
      </Button>

      {/* Contenu principal */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Image du produit */}
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              image={product.imageLocation || '/placeholder.jpg'}
              alt={product.productName}
              sx={{
                borderRadius: 1,
                height: { xs: 250, sm: 300, md: 400 },
                width: '100%',
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Grid>

          {/* Informations produit */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {product.productName}
            </Typography>

            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              {`${product.unitPrice} € / ${product.saleUnit}`}
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
              Producteur: {product.companyName}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Type: {product.productType}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {product.description && (
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Description:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Disponible: {product.totalQuantity} {product.saleUnit}
            </Typography>

            {/* Sélecteur de quantité */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Quantité:
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: 1,
                }}
              >
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  size="small"
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography
                  sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  size="small"
                  disabled={product && quantity >= product.totalQuantity}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Bouton d'ajout au panier */}
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={handleAddToReservation}
              disabled={!product || product.totalQuantity === 0}
            >
              Ajouter à la réservation
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default ProductDetailPage
