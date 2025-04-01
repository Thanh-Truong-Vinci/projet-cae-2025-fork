import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { CartContext } from '../../contexts/CartContext'
import { Product } from '../../types'

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { addToCart } = useContext(CartContext)
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)

        // Appel à l'API pour récupérer les détails du produit
        const response = await fetch(`/api/products/${productId}`)

        if (!response.ok) {
          throw new Error('Produit non trouvé')
        }

        const productData = await response.json()
        console.log('Données reçues:', productData) // Ajout d'un log pour déboguer

        // Transformer les données de l'API pour correspondre à votre interface Product
        const formattedProduct: Product = {
          id: productData.id, // Utiliser id au lieu de idProduct
          name: productData.name,
          price: `10.00€`, // Utiliser une valeur fixe car price n'existe pas dans votre modèle
          image: productData.photo?.url || 'https://via.placeholder.com/300',
          description: productData.description,
          unitType: productData.unitType || 'unité',
          category: productData.type?.title
        }

        setProduct(formattedProduct)
        setError(null)
      } catch (err) {
        setError('Impossible de charger les détails du produit')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => Math.max(1, prev + change))
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
        unitType: product.unitType,
      })
      // Vous pourriez aussi rediriger vers le panier ou afficher une notification
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <Typography>Chargement...</Typography>
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
        <Typography color="text.primary">{product.name}</Typography>
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
              image={product.image}
              alt={product.name}
              sx={{
                borderRadius: 1,
                maxHeight: 400,
                width: '100%',
                objectFit: 'cover',
              }}
            />
          </Grid>

          {/* Informations produit */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>

            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              {product.price}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {product.description}
            </Typography>
          
            <Divider sx={{ my: 2 }} />

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
              startIcon={<AddShoppingCartIcon />}
              fullWidth
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Suggestions ou informations supplémentaires pourraient être ajoutées ici */}
    </Box>
  )
}

export default ProductDetailPage
