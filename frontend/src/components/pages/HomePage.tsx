import { useState, useEffect, useContext } from 'react'
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { CartContext } from '../../contexts/CartContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProductContext } from '../../contexts/ProductContext'
import { Product, ProductType } from '../../types'

const HomePage = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false)
  const [typeError, setTypeError] = useState<string | null>(null)

  // Utilisation sécurisée du ProductContext
  const productContext = useContext(ProductContext)

  if (!productContext) {
    throw new Error(
      'ProductContext doit être utilisé à l intérieur d un ProductProvider'
    )
  }

  const { products, getCategoryLabel, isLoading, error } = productContext

  const cartContext = useContext(CartContext)

  if (!cartContext) {
    throw new Error(
      'CartContext doit être utilisé à l intérieur d un CartProvider'
    )
  }

  const { addToCart } = cartContext

  const [type, setType] = useState('')
  const [productName, setProductName] = useState('')
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [visibleProducts, setVisibleProducts] = useState(10)
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const productsPerRow = 5
  const productsPerLoad = productsPerRow * 2
  const navigate = useNavigate()
  const location = useLocation()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')

  // Nouvel état pour les produits filtrés, initialisé avec les produits du contexte
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Nouvel état pour les produits aléatoires "plus vendus"
  const [topProducts, setTopProducts] = useState<Product[]>([])

  // Ajouter un useEffect pour charger les types depuis l'API
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoadingTypes(true)
      setTypeError(null)

      try {
        const response = await fetch('/api/product-types')
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        const data = await response.json()
        setProductTypes(data)
      } catch (error) {
        console.error('Erreur lors du chargement des types de produits:', error)
        setTypeError('Impossible de charger les types de produits')
      } finally {
        setLoadingTypes(false)
      }
    }

    fetchProductTypes()
  }, [])

  // Générer des produits aléatoires pour les "plus vendus" à partir des produits existants
  useEffect(() => {
    if (products.length > 0) {
      // Si on a moins de 3 produits, on les utilise tous
      if (products.length <= 3) {
        setTopProducts(products.slice())
      } else {
        // Sinon, on en sélectionne 3 aléatoirement
        const shuffledProducts = [...products].sort(() => 0.5 - Math.random())
        setTopProducts(shuffledProducts.slice(0, 3))
      }
    }
  }, [products])

  // Initialize quantities state for all products
  useEffect(() => {
    const initialQuantities: { [key: number]: number } = {}
    products.forEach((product) => {
      initialQuantities[product.id] = 1
    })
    topProducts.forEach((product) => {
      initialQuantities[product.id] = 1
    })
    setQuantities(initialQuantities)
  }, [products, topProducts])

  useEffect(() => {
    // Ne démarrer le carousel que si nous avons des produits à afficher
    if (topProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentProductIndex(
          (prevIndex) => (prevIndex + 1) % topProducts.length
        )
      }, 4000) // Transition plus lente (8 secondes au lieu de 4)
      return () => clearInterval(interval)
    }
  }, [topProducts.length])

  useEffect(() => {
    // Vérifier s'il y a un message de confirmation de réservation
    if (location.state && location.state.message) {
      setMessage(location.state.message)
      setOpenSnackbar(true)

      // Nettoyer l'état de la route pour éviter d'afficher le message à nouveau lors des rafraîchissements
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Mettre à jour filteredProducts quand products change
  useEffect(() => {
    if (products) {
      setFilteredProducts(products)
    }
  }, [products])

  const handleFilter = () => {
    let results = [...products]

    if (type) {
      results = products.filter(
        (product) =>
          product.category === type ||
          (product.productType && product.productType.title === type)
      )
    }

    if (productName.trim()) {
      const searchTerm = productName.toLowerCase().trim()
      results = results.filter((product) =>
        product.name.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredProducts(results)
    setVisibleProducts(productsPerLoad)
  }

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + value),
    }))
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantities[product.id] || 1,
      unitType: product.unitType,
      category: product.category || 'autres', // Ajout de la propriété category
    })
  }

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Carrousel des produits les plus vendus */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#ddd',
          p: 5,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5">Produits les plus vendus</Typography>
        {topProducts.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 2,
              px: 4,
            }}
          >
            {/* Informations du produit à gauche */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pr: 4,
                textAlign: 'left',
                cursor: 'pointer', // Ajout du curseur pointer
              }}
              onClick={() =>
                handleProductClick(topProducts[currentProductIndex].id)
              }
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {topProducts[currentProductIndex].name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Prix: {topProducts[currentProductIndex].price}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(
                      topProducts[currentProductIndex].id,
                      -1
                    )
                  }}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 1 }}>
                  {quantities[topProducts[currentProductIndex].id] || 1}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    handleQuantityChange(topProducts[currentProductIndex].id, 1)
                  }}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                color="success"
                startIcon={<AddShoppingCartIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToCart(topProducts[currentProductIndex])
                }}
              >
                Ajouter au panier
              </Button>
            </Box>

            {/* Image du produit à droite */}
            <Box sx={{ flex: 1 }}>
              <img
                src={topProducts[currentProductIndex].image}
                alt={topProducts[currentProductIndex].name}
                style={{
                  width: 300,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer', // Ajout du curseur pointer
                }}
                onClick={() =>
                  handleProductClick(topProducts[currentProductIndex].id)
                }
              />
            </Box>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Aucun produit disponible pour le moment.
          </Typography>
        )}
      </Box>

      {/* Sidebar */}
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Box sx={{ width: 350, backgroundColor: '#f0f0f0', p: 2 }}>
          <Typography variant="h6">Filtrer</Typography>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            displayEmpty
            fullWidth
            size="small"
            sx={{ my: 2, bgcolor: 'white' }}
            disabled={loadingTypes}
          >
            <MenuItem value="">Filtrer par type</MenuItem>
            {loadingTypes ? (
              <MenuItem disabled>Chargement...</MenuItem>
            ) : typeError ? (
              <MenuItem disabled>Erreur de chargement</MenuItem>
            ) : (
              productTypes.map((productType) => (
                <MenuItem key={productType.id} value={productType.title}>
                  {productType.title}
                </MenuItem>
              ))
            )}
          </Select>
          <TextField
            placeholder="Nom du produit"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2, bgcolor: 'white' }}
          />
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleFilter}
          >
            CONFIRMER
          </Button>
        </Box>

        {/* Liste des produits */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            justifyContent: 'center',
          }}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, visibleProducts).map((product) => (
              <Card
                key={product.id}
                sx={{ width: 250, height: 'auto', mb: 2, cursor: 'pointer' }} // Ajout du curseur pointer
                onClick={() => handleProductClick(product.id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prix: {product.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Catégorie: {getCategoryLabel(product.category || '')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuantityChange(product.id, -1)
                        }}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 1 }}>
                        {quantities[product.id] || 1}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuantityChange(product.id, 1)
                        }}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(product)
                      }}
                    >
                      <AddShoppingCartIcon />
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ py: 5 }}>
              Aucun produit ne correspond à vos critères de recherche.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Bouton Voir Plus */}
      {visibleProducts < filteredProducts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={() =>
              setVisibleProducts((prev) =>
                Math.min(prev + productsPerLoad, filteredProducts.length)
              )
            }
          >
            Voir plus
          </Button>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
          {filteredProducts.length > 0
            ? "Il n'y a plus de produits à afficher."
            : ''}
        </Typography>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default HomePage
