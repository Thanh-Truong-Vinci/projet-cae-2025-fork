import { useState, useEffect, useContext, useMemo } from 'react'
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
  producerName?: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

const HomePage = () => {
  const [type, setType] = useState('')
  const [productName, setProductName] = useState('')
  const [currentProductIndex, setCurrentProductIndex] = useState(0)
  const [visibleProducts, setVisibleProducts] = useState(10)
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const { addToCart } = useContext(CartContext)
  const productsPerRow = 5
  const productsPerLoad = productsPerRow * 2
  const navigate = useNavigate()
  const location = useLocation()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [message, setMessage] = useState('')
  const [productBatches, setProductBatches] = useState<ProductBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productTypes, setProductTypes] = useState<string[]>([])

  // Charger les lots de produits approuvés
  useEffect(() => {
    const fetchApprovedBatches = async () => {
      setLoading(true)
      try {
        // Récupérer les lots depuis localStorage
        const savedBatches = localStorage.getItem('producerBatches');
        
        if (savedBatches) {
          // Filtrer uniquement les lots approuvés avec quantité disponible > 0
          const allBatches = JSON.parse(savedBatches);
          const approvedBatches = allBatches.filter((batch: ProductBatch) => 
            batch.status === 'approved' && batch.availableQuantity > 0
          );
          
          setProductBatches(approvedBatches);
          
          // Extraire tous les types de produits uniques pour le filtre
          const types = [...new Set(approvedBatches.map((batch: ProductBatch) => batch.productType))];
          setProductTypes(types as string[]);
        } else {
          setProductBatches([]);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovedBatches();
  }, []);

  // Extraire les produits les plus vendus (ceux avec la plus grande différence entre quantité initiale et disponible)
  const topProducts = useMemo(() => {
    if (productBatches.length === 0) return [];
    
    // Trier les lots par nombre d'unités vendues (initialQuantity - availableQuantity)
    return [...productBatches]
      .sort((a, b) => 
        ((b.initialQuantity - b.availableQuantity) / b.initialQuantity) - 
        ((a.initialQuantity - a.availableQuantity) / a.initialQuantity)
      )
      .slice(0, 3); // Prendre les 3 premiers
  }, [productBatches]);

  // Filtrer les produits en fonction des critères de recherche
  const filteredProducts = useMemo(() => {
    return productBatches.filter(product => {
      const matchesType = !type || product.productType === type;
      const matchesName = !productName || 
        product.productName.toLowerCase().includes(productName.toLowerCase());
      return matchesType && matchesName;
    });
  }, [productBatches, type, productName]);

  // Initialize quantities state for all products
  useEffect(() => {
    const initialQuantities: { [key: number]: number } = {}
    productBatches.forEach((product) => {
      initialQuantities[product.id] = 1
    })
    setQuantities(initialQuantities)
  }, [productBatches])

  useEffect(() => {
    // Ne démarrer le carrousel que si nous avons des produits vedettes
    if (topProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentProductIndex(
          (prevIndex) => (prevIndex + 1) % topProducts.length
        )
      }, 8000) // Transition plus lente (8 secondes au lieu de 4)
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

  const handleFilter = () => {
    // Le filtrage est déjà géré par le useMemo
    console.log('Filtrage avec:', type, productName)
  }

  const handleResetFilter = () => {
    setType('');
    setProductName('');
  }

  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + value),
    }))
  }

  const handleAddToCart = (product: ProductBatch) => {
    const quantity = quantities[product.id] || 1;
    
    // Vérifier que la quantité demandée n'excède pas la disponibilité
    if (quantity > product.availableQuantity) {
      setMessage(`Désolé, il n'y a que ${product.availableQuantity} ${product.unitType} disponible(s)`);
      setOpenSnackbar(true);
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.productName,
      price: `${product.unitPrice}€`,
      image: product.imageUrl,
      quantity: quantity,
      unitType: product.unitType || 'unité' // Ajoutez cette ligne
    })
  }

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // Formatter le prix avec le type d'unité
  const formatPrice = (price: number, unitType: string) => {
    return `${price.toFixed(2)}€/${unitType}`;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Carrousel des produits les plus vendus */}
      {topProducts.length > 0 && (
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#f0f8ea',
            p: 5,
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>Nos produits vedettes</Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
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
                alignItems: { xs: 'center', md: 'flex-start' },
                justifyContent: 'center',
                pr: { xs: 0, md: 4 },
                pb: { xs: 3, md: 0 },
                textAlign: { xs: 'center', md: 'left' },
                cursor: 'pointer',
              }}
              onClick={() =>
                handleProductClick(topProducts[currentProductIndex].id)
              }
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {topProducts[currentProductIndex].productName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Type: {topProducts[currentProductIndex].productType}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Prix: {formatPrice(
                  topProducts[currentProductIndex].unitPrice,
                  topProducts[currentProductIndex].unitType
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {topProducts[currentProductIndex].availableQuantity} {topProducts[currentProductIndex].unitType} disponible(s)
              </Typography>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2
                }}
                onClick={(e) => e.stopPropagation()} // Empêcher le clic de remonter
              >
                <IconButton
                  onClick={() =>
                    handleQuantityChange(topProducts[currentProductIndex].id, -1)
                  }
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 1 }}>
                  {quantities[topProducts[currentProductIndex].id] || 1}
                </Typography>
                <IconButton
                  onClick={() =>
                    handleQuantityChange(topProducts[currentProductIndex].id, 1)
                  }
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
                  e.stopPropagation();
                  handleAddToCart(topProducts[currentProductIndex]);
                }}
              >
                Ajouter au panier
              </Button>
            </Box>

            {/* Image du produit à droite */}
            <Box sx={{ flex: 1 }}>
              <img
                src={topProducts[currentProductIndex].imageUrl}
                alt={topProducts[currentProductIndex].productName}
                style={{
                  width: '100%',
                  maxWidth: 300,
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  handleProductClick(topProducts[currentProductIndex].id)
                }
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Sidebar */}
      <Box sx={{ display: 'flex', width: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ 
          width: { xs: '100%', md: 350 }, 
          backgroundColor: '#f0f0f0', 
          p: 2 
        }}>
          <Typography variant="h6">Filtrer</Typography>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as string)}
            displayEmpty
            fullWidth
            size="small"
            sx={{ my: 2, bgcolor: 'white' }}
          >
            <MenuItem value="">Tous les types</MenuItem>
            {productTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
          <TextField
            placeholder="Nom du produit"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2, bgcolor: 'white' }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={handleFilter}
            >
              FILTRER
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={handleResetFilter}
            >
              RÉINITIALISER
            </Button>
          </Box>
        </Box>

        {/* Liste des produits */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                Aucun produit ne correspond à votre recherche.
              </Typography>
              {(type || productName) && (
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={handleResetFilter}
                  sx={{ mt: 1 }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'center',
                }}
              >
                {filteredProducts.slice(0, visibleProducts).map((product) => (
                  <Card
                    key={product.id}
                    sx={{ 
                      width: 250, 
                      height: 'auto', 
                      mb: 2, 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={product.imageUrl}
                      alt={product.productName}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {product.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {product.productType}
                      </Typography>
                      <Typography variant="body1" color="primary.main">
                        {formatPrice(product.unitPrice, product.unitType)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.availableQuantity} {product.unitType} disponible(s)
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
                        onClick={(e) => e.stopPropagation()} // Empêcher le clic de remonter
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            onClick={() => handleQuantityChange(product.id, -1)}
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>
                            {quantities[product.id] || 1}
                          </Typography>
                          <IconButton
                            onClick={() => handleQuantityChange(product.id, 1)}
                            size="small"
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleAddToCart(product)}
                        >
                          <AddShoppingCartIcon />
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                ))}
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
              ) : filteredProducts.length > 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
                  Il n'y a plus de produits à afficher.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Box>

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
