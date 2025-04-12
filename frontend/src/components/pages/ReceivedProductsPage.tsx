import { useContext, useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ProductContext } from '../../contexts/ProductContext'
import { BatchContext } from '../../contexts/BatchContext'
import { UserContext } from '../../contexts/UserContext'
import { Batch, ProductBatch } from '../../types'
import { useNavigate } from 'react-router-dom'

interface ProductWithBatches extends ProductBatch {
  batches: Batch[]
}

const ReceivedProductsPage = () => {
  const navigate = useNavigate()
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
  } = useContext(ProductContext)!

  const {
    receivedBatches,
    fetchReceivedBatches,
    isLoading: batchesLoading,
    error: batchesError,
  } = useContext(BatchContext)!

  const { authenticatedUser } = useContext(UserContext)!
  const [productsWithBatches, setProductsWithBatches] = useState<
    ProductWithBatches[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or not a manager
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Manager') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  // Fetch received batches
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await fetchReceivedBatches()
      } catch (err) {
        console.error('Error loading received batches:', err)
        setError('Impossible de charger les lots reçus')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchReceivedBatches])

  // Link products and batches
  useEffect(() => {
    if (products.length > 0 && receivedBatches.length > 0) {
      // Create a map of products with their associated batches
      const productMap = new Map<string, ProductWithBatches>()

      products.forEach((product) => {
        productMap.set(product.productName.toLowerCase(), {
          ...product,
          batches: [],
        })
      })

      // Associate batches with products
      receivedBatches.forEach((batch) => {
        const productName = batch.productName.toLowerCase()
        if (productMap.has(productName)) {
          const product = productMap.get(productName)
          if (product) {
            product.batches.push(batch)
          }
        }
      })

      // Convert map to array
      setProductsWithBatches(
        Array.from(productMap.values()).filter((p) => p.batches.length > 0)
      )
    }
  }, [products, receivedBatches])

  if (productsLoading || batchesLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (productsError || batchesError || error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {productsError || batchesError || error}
      </Alert>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        Produits Reçus en Stock
      </Typography>

      {productsWithBatches.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Aucun produit reçu disponible actuellement
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {productsWithBatches.map((product) => (
            <Grid item xs={12} key={product.productId}>
              <Card
                elevation={3}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: '100%', md: 200 },
                    height: { xs: 200, md: 'auto' },
                    objectFit: 'cover',
                  }}
                  image={
                    product.imageLocation || 'https://via.placeholder.com/150'
                  }
                  alt={product.productName}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h5" component="h2">
                          {product.productName}
                        </Typography>
                        <Chip
                          label={product.productType}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Typography variant="h6" color="primary">
                        {product.batches.reduce(
                          (sum, batch) => sum + batch.availableQuantity,
                          0
                        )}{' '}
                        en stock
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{ mb: 3 }}
                    >
                      {product.description || 'Aucune description disponible.'}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Lots disponibles:
                    </Typography>

                    <TableContainer
                      component={Paper}
                      elevation={0}
                      variant="outlined"
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date réception</TableCell>
                            <TableCell>Producteur</TableCell>
                            <TableCell align="right">Quantité</TableCell>
                            <TableCell align="right">Prix</TableCell>
                            <TableCell>Unité</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {product.batches.map((batch) => (
                            <TableRow key={batch.id}>
                              <TableCell>
                                {format(
                                  new Date(batch.availabilityDate),
                                  'dd MMM yyyy',
                                  { locale: fr }
                                )}
                              </TableCell>
                              <TableCell>{batch.producerName}</TableCell>
                              <TableCell align="right">
                                {batch.availableQuantity}
                              </TableCell>
                              <TableCell align="right">
                                {batch.unitPrice.toFixed(2)}€
                              </TableCell>
                              <TableCell>{batch.unitType}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default ReceivedProductsPage
