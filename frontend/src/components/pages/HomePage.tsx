import { useState, useEffect, useContext, useCallback } from 'react'
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
import { ReservationContext } from '../../contexts/ReservationContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { ProductContext } from '../../contexts/ProductContext'
import { ProductType } from '../../types'
import { ProductBatch } from '../../types'

const HomePage = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false)
  const [typeError, setTypeError] = useState<string | null>(null)

  const productContext = useContext(ProductContext)

  if (!productContext) {
    throw new Error(
      "ProductContext doit être utilisé à l'intérieur d'un ProductProvider"
    )
  }

  const { products, isLoading, error } = productContext

  const reservationContext = useContext(ReservationContext)

  if (!reservationContext) {
    throw new Error(
      "ReservationContext doit être utilisé à l'intérieur d'un ReservationProvider"
    )
  }

  const { createReservation } = reservationContext

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

  // Produits filtrés
  const [filteredProducts, setFilteredProducts] = useState<ProductBatch[]>([])

  // Produits récents (5 derniers lots reçus)
  const [topProducts, setTopProducts] = useState<ProductBatch[]>([])

  // Ajouter un useEffect pour charger les types depuis l'API
  useEffect(() => {
    const fetchProductTypes = async () => {
      setLoadingTypes(true)
      setTypeError(null)

      try {
        const response = await fetch((import.meta.env.VITE_API_URL || '') + '/api/product-types')
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

  // Sélectionner les 5 lots les plus récents en état RECEIVED
  useEffect(() => {
    if (products.length > 0) {
      // Trier les produits par date de production (les plus récents en premier)
      const sortedProducts = [...products].sort((a, b) => {
        const dateA = new Date(a.earliestProductionDate).getTime()
        const dateB = new Date(b.earliestProductionDate).getTime()
        return dateB - dateA // Ordre décroissant (plus récent d'abord)
      })

      // Prendre les 5 premiers (ou moins s'il y a moins de 5 produits)
      const recentCount = Math.min(5, sortedProducts.length)
      setTopProducts(sortedProducts.slice(0, recentCount))
    }
  }, [products])

  // Initialiser les quantités
  useEffect(() => {
    const initialQuantities: { [key: number]: number } = {}
    products.forEach((product: ProductBatch) => {
      initialQuantities[product.productId] = 1
    })
    setQuantities(initialQuantities)
  }, [products])

  // Carousel
  useEffect(() => {
    if (topProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentProductIndex(
          (prevIndex) => (prevIndex + 1) % topProducts.length
        )
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [topProducts.length])

  // Vérifier les messages de confirmation
  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage(location.state.message)
      setOpenSnackbar(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Mettre à jour filteredProducts
  useEffect(() => {
    if (products) {
      const seen = new Set()
      const uniqueProducts = products.filter((p: ProductBatch) => {
        const key = `${p.productId}-${p.unitPrice}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setFilteredProducts(uniqueProducts)
    }
  }, [products])

  // ça va nous permettre de ne pas avoir soucis de différence de casse, d'espaces ou d'accents
  const normalizeString = useCallback((str: string | undefined): string => {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }, [])

  const handleFilter = useCallback(() => {
    const seen = new Set()
    let results = products.filter((p: ProductBatch) => {
      const key = `${p.productId}-${p.unitPrice}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    if (type) {
      const normalizedType = normalizeString(type)
      results = results.filter((product: ProductBatch) => {
        const normalizedCategory = normalizeString(product.productType)
        return normalizedCategory === normalizedType
      })
    }

    if (productName.trim()) {
      const searchTerm = productName.toLowerCase().trim()
      results = results.filter((product: ProductBatch) =>
        product.productName.toLowerCase().includes(searchTerm)
      )
    }

    setFilteredProducts(results)
    setVisibleProducts(productsPerLoad)
  }, [products, type, productName, productsPerLoad, normalizeString])

  const handleQuantityChange = (
    productId: number,
    value: number,
    maxQuantity: number
  ) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min(
        maxQuantity,
        Math.max(1, (prev[productId] || 1) + value)
      ),
    }))
  }

  const handleAddToReservation = (productBatch: ProductBatch) => {
    const qty = quantities[productBatch.productId] || 1
    reserveBatch(productBatch, qty, 0)
  }

  const reserveBatch = (
    productBatch: ProductBatch,
    qty: number,
    index: number
  ) => {
    // Si l'index dépasse le nombre de lots disponibles, on s'arrête
    if (index >= productBatch.batchIds.length) {
      return
    }

    // Si on demande plus que ce qui est disponible dans ce lot
    if (qty > productBatch.batchQuantities[index]) {
      // Créer une réservation pour ce qui est disponible dans ce lot
      createReservation(
        productBatch.batchIds[index],
        productBatch.batchQuantities[index]
      )
        .then(() => {
          setMessage(
            `${productBatch.batchQuantities[index]} ${productBatch.batchQuantities[index] > 1 ? 'articles' : 'article'} "${productBatch.productName}" ${productBatch.batchQuantities[index] > 1 ? 'ajoutés' : 'ajouté'} au panier`
          )
          setOpenSnackbar(true)

          // Mettre à jour l'UI
          const remainingTotalQty =
            productBatch.totalQuantity - productBatch.batchQuantities[index]
          updateProductDisplay(productBatch, remainingTotalQty)

          // Poursuivre avec le reste de la quantité sur le lot suivant
          reserveBatch(
            {
              ...productBatch,
              totalQuantity: remainingTotalQty,
            },
            qty - productBatch.batchQuantities[index],
            index + 1
          )
        })
        .catch((error) => {
          setMessage(`Erreur lors de l'ajout au panier: ${error.message}`)
          setOpenSnackbar(true)
        })
    } else {
      // Si la quantité demandée est disponible dans ce lot
      const remainingQuantity = productBatch.totalQuantity - qty

      createReservation(productBatch.batchIds[index], qty)
        .then(() => {
          setMessage(
            `${qty} ${qty > 1 ? 'articles' : 'article'} "${productBatch.productName}" ${qty > 1 ? 'ajoutés' : 'ajouté'} au panier`
          )
          setOpenSnackbar(true)

          updateProductDisplay(productBatch, remainingQuantity)
        })
        .catch((error) => {
          setMessage(`Erreur lors de l'ajout au panier: ${error.message}`)
          setOpenSnackbar(true)
        })
    }
  }

  // Fonction utilitaire pour mettre à jour l'affichage des produits
  const updateProductDisplay = (
    productBatch: ProductBatch,
    remainingQuantity: number
  ) => {
    if (remainingQuantity <= 0) {
      // Supprimer complètement le produit de la liste filtrée
      setFilteredProducts((prevProducts) =>
        prevProducts.filter(
          (p: ProductBatch) =>
            p.productId !== productBatch.productId ||
            p.unitPrice !== productBatch.unitPrice
        )
      )

      // Également supprimer le produit du carrousel
      setTopProducts((prevProducts) => {
        const newTopProducts = prevProducts.filter(
          (p: ProductBatch) =>
            p.productId !== productBatch.productId ||
            p.unitPrice !== productBatch.unitPrice
        )

        // Si le produit actuel du carrousel a été supprimé, ajuster l'index
        if (
          newTopProducts.length < prevProducts.length &&
          currentProductIndex >= newTopProducts.length &&
          newTopProducts.length > 0
        ) {
          setCurrentProductIndex(0) // Réinitialiser à 0 si nécessaire
        }

        return newTopProducts
      })
    } else {
      // Si le produit a encore du stock, mettre à jour la quantité affichée
      setFilteredProducts((prevProducts) =>
        prevProducts.map((p: ProductBatch) =>
          p.productId === productBatch.productId &&
          p.unitPrice === productBatch.unitPrice
            ? { ...p, totalQuantity: remainingQuantity }
            : p
        )
      )

      // Mettre à jour également la quantité dans le carrousel
      setTopProducts((prevProducts) =>
        prevProducts.map((p: ProductBatch) =>
          p.productId === productBatch.productId &&
          p.unitPrice === productBatch.unitPrice
            ? { ...p, totalQuantity: remainingQuantity }
            : p
        )
      )
    }
  }

  const handleProductClick = (product: ProductBatch) => {
    navigate(`/products/${product.productId}`, { state: { product } })
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  const refreshProducts = useCallback(() => {
    const now = Date.now()
    console.log('Rafraîchissement forcé des produits...')

    // Ajouter un paramètre nocache pour éviter les problèmes de mise en cache
    return fetch((import.meta.env.VITE_API_URL || '') + '/api/batches/received/available-view?nocache=' + now, {
      headers: {
        pragma: 'no-cache',
        'cache-control': 'no-cache',
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Erreur: ${response.status}`)
        return response.json()
      })
      .then((data) => {
        console.log('Données fraîches reçues:', data)

        // IMPORTANT: Filtrer les produits avec quantité 0
        const filteredData = data.filter(
          (product: ProductBatch) => product.totalQuantity > 0
        )

        setFilteredProducts(filteredData)

        // Mettre également à jour les produits du carrousel avec les données fraîches
        const sortedProducts = [...filteredData].sort((a, b) => {
          const dateA = new Date(a.earliestProductionDate).getTime()
          const dateB = new Date(b.earliestProductionDate).getTime()
          return dateB - dateA
        })

        const recentCount = Math.min(5, sortedProducts.length)
        setTopProducts(sortedProducts.slice(0, recentCount))
      })
      .catch((error) => {
        console.error('Erreur de rafraîchissement:', error)
      })
  }, [])

  // Modifier l'effet existant pour réagir à plus d'événements
  useEffect(() => {
    // Rafraîchissement forcé lors du chargement initial de la page
    if (location.pathname === '/') {
      // Court délai pour laisser le temps à l'interface de s'afficher d'abord
      setTimeout(() => refreshProducts(), 100)
    }

    // Écouteur d'événements pour le retour à la page via la navigation
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && location.pathname === '/') {
        refreshProducts()
      }
    }

    // Écouteur d'événements pour les changements dans le panier
    const handleCartUpdate = () => {
      if (location.pathname === '/') {
        refreshProducts()
      }
    }

    // Enregistrer TOUS les écouteurs possibles
    window.addEventListener('product-quantity-changed', handleCartUpdate)
    window.addEventListener('cart-quantities-updated', handleCartUpdate)
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleCartUpdate)

    return () => {
      window.removeEventListener('product-quantity-changed', handleCartUpdate)
      window.removeEventListener('cart-quantities-updated', handleCartUpdate)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleCartUpdate)
    }
  }, [location.pathname, refreshProducts])

  // Modifier l'effet qui restaure la position de défilement

  // Avant l'effet, ajouter cette variable qui extrait l'assertion de type
  const typedProducts = products as ProductBatch[]

  // Puis modifier l'effet comme suit
  useEffect(() => {
    const scrollPosition = sessionStorage.getItem('scrollPosition')
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition))
      sessionStorage.removeItem('scrollPosition')
    }
  }, [typedProducts]) // Utiliser la variable extraite au lieu de l'expression complexe

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
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: 'auto',
        overflow: 'hidden',
        mb: 10, // AJOUT: Marge en bas pour laisser de l'espace au footer
        position: 'relative',
      }}
    >
      {/* Sidebar avec filtres */}
      <Box
        sx={{
          width: 300,
          backgroundColor: '#f0f0f0',
          p: 2,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>
          Filtrer
        </Typography>
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

      {/* Partie droite contenant le carrousel et la liste des produits */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Carrousel - hauteur fixe */}
        {topProducts.length > 0 && (
          <Box
            sx={{
              width: '100%',
              backgroundColor: '#ddd',
              p: 2,
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <Typography variant="h5">Produits les plus récents</Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 2,
                px: 4,
              }}
            >
              {/* Informations du produit */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  pr: 4,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  handleProductClick(topProducts[currentProductIndex])
                }
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {topProducts[currentProductIndex].productName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Prix: {topProducts[currentProductIndex].unitPrice} € /{' '}
                  {topProducts[currentProductIndex].saleUnit}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Producteur: {topProducts[currentProductIndex].companyName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuantityChange(
                        topProducts[currentProductIndex].productId,
                        -1,
                        topProducts[currentProductIndex].totalQuantity
                      )
                    }}
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 1 }}>
                    {quantities[topProducts[currentProductIndex].productId] ||
                      1}
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuantityChange(
                        topProducts[currentProductIndex].productId,
                        1,
                        topProducts[currentProductIndex].totalQuantity
                      )
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
                    handleAddToReservation(topProducts[currentProductIndex])
                  }}
                >
                  Ajouter à la réservation
                </Button>
              </Box>
              {/* Image du produit */}
              <Box sx={{ flex: 1 }}>
                <img
                  src={
                    topProducts[currentProductIndex].imageLocation ||
                    '/placeholder.jpg'
                  }
                  alt={topProducts[currentProductIndex].productName}
                  style={{
                    width: 300,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    handleProductClick(topProducts[currentProductIndex])
                  }
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Liste des produits - avec défilement propre */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            justifyContent: 'center',
            overflowY: 'auto',
            height: '100%',
          }}
        >
          {filteredProducts.length > 0 ? (
            filteredProducts
              .slice(0, visibleProducts)
              .map((product: ProductBatch) => (
                <Card
                  key={`${product.productId}-${product.unitPrice}`}
                  sx={{
                    width: 220,
                    height: 340,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleProductClick(product)}
                >
                  <CardMedia
                    component="img"
                    height="120"
                    image={product.imageLocation || '/placeholder.jpg'}
                    alt={product.productName}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent
                    sx={{ flexGrow: 1, py: 1, position: 'relative' }}
                  >
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{
                        fontSize: '1rem',
                        height: '2.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                      }}
                    >
                      {product.productName}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {product.unitPrice} € / {product.saleUnit}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.5,
                      }}
                    >
                      {product.companyName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Disponible: {product.totalQuantity} {product.saleUnit}
                    </Typography>

                    {/* Type de produit positionné en bas à gauche */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          backgroundColor: '#2e7d32',
                          color: 'white',
                          fontSize: '0.8rem',
                          py: 0.5,
                          px: 2,
                          borderRadius: '12px',
                          display: 'inline-block',
                          fontWeight: 500,
                        }}
                      >
                        {product.productType}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 1, pt: 0, mt: 'auto' }}>
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
                            handleQuantityChange(
                              product.productId,
                              -1,
                              product.totalQuantity
                            )
                          }}
                          size="small"
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography
                          variant="body2"
                          sx={{
                            mx: 0.5,
                            minWidth: '1.5rem',
                            textAlign: 'center',
                          }}
                        >
                          {quantities[product.productId] || 1}
                        </Typography>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQuantityChange(
                              product.productId,
                              1,
                              product.totalQuantity
                            )
                          }}
                          size="small"
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToReservation(product)
                        }}
                        sx={{ minWidth: 'unset', px: 1 }}
                      >
                        <AddShoppingCartIcon fontSize="small" />
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

        {/* Bouton Voir Plus */}
        {visibleProducts < filteredProducts.length && (
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
        )}
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
