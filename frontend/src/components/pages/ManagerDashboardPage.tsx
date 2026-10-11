import React, { useContext, useEffect, useState } from 'react'
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  LinearProgress,
} from '@mui/material'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ProductContext } from '../../contexts/ProductContext'
import { BatchContext } from '../../contexts/BatchContext'
import { UserContext } from '../../contexts/UserContext'
import { StatisticsContext } from '../../contexts/StatisticsContext'
import { Batch, ProductBatch, RawBatch } from '../../types'
import { useNavigate } from 'react-router-dom'

interface ProductWithBatches extends ProductBatch {
  batches: Batch[]
}

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
]

const getStatusLabel = (
  status: string | undefined,
  availableQuantity: number
) => {
  if (availableQuantity === 0) {
    return { label: 'Épuisé', color: 'error' as const }
  }

  switch (status?.toUpperCase()) {
    case 'PENDING':
      return { label: 'En attente', color: 'warning' as const }
    case 'REJECTED':
      return { label: 'Refusé', color: 'error' as const }
    case 'APPROVED':
      return { label: 'Accepté', color: 'success' as const }
    case 'RECEIVED':
      return { label: 'En vente', color: 'info' as const }
    default:
      return { label: 'Indéterminé', color: 'default' as const }
  }
}

// Fonction d'aide pour formater les dates de façon sécurisée
const formatSafeDate = (
  dateValue: string | Date | null | undefined,
  formatStr: string
) => {
  if (!dateValue) return 'Date inconnue'

  try {
    const date = new Date(dateValue)
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) return 'Date invalide'
    return format(date, formatStr, { locale: fr })
  } catch (error) {
    console.error('Erreur de formatage de date:', error, dateValue)
    return 'Date invalide'
  }
}

const getSafeBatch = (batch: RawBatch): Batch => {
  try {
    console.log('Structure du lot brut:', batch)

    // Extraire le nom du producteur
    let producerName = 'Producteur inconnu'
    if (batch.producer) {
      // Vérifier si c'est le format d'entité BRUTE (non DTO)
      if (typeof batch.producer === 'object' && batch.producer !== null) {
        const firstName = batch.producer.firstname || ''
        const lastName = batch.producer.name || ''
        if (firstName || lastName) {
          producerName = `${firstName} ${lastName}`.trim()
        } else if (batch.producer.company) {
          producerName = batch.producer.company
        }
      } else if (batch.producerName) {
        producerName = batch.producerName
      } else if (typeof batch.producer === 'string') {
        producerName = batch.producer
      }
    } else if (batch.producerName) {
      producerName = batch.producerName
    }

    // Récupération du nom du produit avec vérification des différents formats possibles
    let productName = 'Produit sans nom'
    if (typeof batch.product === 'object' && batch.product?.name) {
      productName = batch.product.name
    } else if (batch.productName) {
      productName = batch.productName
    }

    // Récupération du type de produit avec vérification des différents formats possibles
    let productType = 'Type inconnu'
    if (typeof batch.product === 'object' && batch.product?.type?.title) {
      productType = batch.product.type.title
    } else if (batch.productType) {
      productType = batch.productType
    }

    // Récupération de l'URL d'image avec vérification des différents formats possibles
    let imageUrl = 'https://via.placeholder.com/150'
    if (typeof batch.photo === 'object' && batch.photo?.imageLocation) {
      imageUrl = batch.photo.imageLocation
    } else if (batch.imageUrl) {
      imageUrl = batch.imageUrl
    } else if (batch.imageLocation) {
      imageUrl = batch.imageLocation
    }

    // Vérifiez que le statut est une des valeurs valides
    const validStatus = ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED']
    const status =
      batch.status && validStatus.includes(batch.status.toUpperCase())
        ? batch.status.toUpperCase()
        : 'PENDING'

    // Définir une date par défaut pour les dates manquantes
    const today = new Date().toISOString()
    // S'assurer que les valeurs sont toujours des chaînes de caractères
    const createdAtStr =
      typeof batch.createdAt === 'object'
        ? (batch.createdAt as Date).toISOString()
        : String(batch.createdAt || batch.productionDate || today)
    const availabilityDateStr =
      typeof batch.availabilityDate === 'object'
        ? (batch.availabilityDate as Date).toISOString()
        : String(batch.availabilityDate || today)

    return {
      id: batch.id || 0,
      productName: productName,
      productType: productType,
      imageUrl: imageUrl,
      availabilityDate: availabilityDateStr,
      availableQuantity:
        typeof batch.availableQuantity === 'number'
          ? batch.availableQuantity
          : 0,
      unitPrice: typeof batch.unitPrice === 'number' ? batch.unitPrice : 0,
      unitType: batch.saleUnit || batch.unitType || 'unité',
      producerId:
        typeof batch.producer === 'object' && batch.producer !== null
          ? batch.producer.id || 0
          : batch.producerId || 0,
      producerName: producerName,
      createdAt: createdAtStr,
      status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED',
      rejectionReason: batch.rejectionReason || '',
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage du batch:', error, batch)
    // Objet par défaut inchangé...
    return {
      id: batch?.id || 0,
      productName: 'Erreur: Données corrompues',
      productType: 'Type inconnu',
      imageUrl: 'https://via.placeholder.com/150',
      availabilityDate: '',
      availableQuantity: 0,
      unitPrice: 0,
      unitType: 'unité',
      producerId: 0,
      producerName: 'Producteur inconnu',
      createdAt: '',
      status: 'PENDING',
      rejectionReason: '',
    }
  }
}

// Produits et lots
const ManagerDashboardPage = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [batchStatusTabValue, setBatchStatusTabValue] = useState(0)
  const [allBatches, setAllBatches] = useState<Batch[]>([])
  const [isBatchesLoading, setIsBatchesLoading] = useState(false)
  const [batchesError, setBatchesError] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
  } = useContext(ProductContext)!

  const {
    receivedBatches,
    fetchReceivedBatches,
    isLoading: batchesLoading,
    error: batchContextError,
  } = useContext(BatchContext)!

  const [productsWithBatches, setProductsWithBatches] = useState<
    ProductWithBatches[]
  >([])

  // Statistiques
  const {
    salesStatistics,
    isLoading: statsLoading,
    error: statsError,
    fetchSalesStatistics,
  } = useContext(StatisticsContext)!
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined
  )
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >(undefined)

  // Ajouter cet état pour stocker tous les produits uniques
  const [allUniqueProducts, setAllUniqueProducts] = useState<
    Array<{ productId: number; productName: string }>
  >([])

  // États généraux
  const { authenticatedUser } = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Gestion des onglets
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleBatchStatusTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setBatchStatusTabValue(newValue)
  }

  // Générateur d'années pour le filtre (5 dernières années)
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i)

  // Gestionnaires d'événements pour les filtres
  const handleYearChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value
    setSelectedYear(value === '' ? undefined : Number(value))
  }

  const handleMonthChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value
    setSelectedMonth(value === '' ? undefined : Number(value))
  }

  const handleProductChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value
    setSelectedProductId(value === '' ? undefined : Number(value))
  }

  // Rediriger si non authentifié ou non gestionnaire
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Manager') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  // Intercepter les erreurs pour obtenir la pile d'appel
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('Erreur globale interceptée:', event.error)
      event.preventDefault() // Empêcher le crash
      setGlobalError(
        event.error?.message || "Une erreur inconnue s'est produite"
      )
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  // Charger les lots reçus
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

  useEffect(() => {
    const fetchAllBatches = async () => {
      if (tabValue !== 1) return

      setIsBatchesLoading(true)
      setBatchesError(null)

      try {
        const response = await fetch('https://projet-cae-2025-fork.onrender.com/api/batches', {
          headers: {
            Authorization: authenticatedUser?.token || '',
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        const data = await response.json()
        console.log('Données brutes des lots:', data)

        // Nettoyage plus robuste des données
        const safeData = Array.isArray(data) ? data.map(getSafeBatch) : []
        console.log('Données sécurisées:', safeData)

        setAllBatches(safeData)
      } catch (err) {
        console.error('Erreur lors de la récupération des lots:', err)
        setBatchesError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setIsBatchesLoading(false)
      }
    }

    fetchAllBatches()
  }, [tabValue, authenticatedUser])

  // Lier les produits et lots
  useEffect(() => {
    if (products.length > 0 && receivedBatches.length > 0) {
      const productMap = new Map<string, ProductWithBatches>()

      products.forEach((product) => {
        productMap.set(product.productName.toLowerCase(), {
          ...product,
          batches: [],
        })
      })

      receivedBatches.forEach((batch) => {
        const productName = batch.productName.toLowerCase()
        if (productMap.has(productName)) {
          const product = productMap.get(productName)
          if (product) {
            product.batches.push(batch)
          }
        }
      })

      setProductsWithBatches(
        Array.from(productMap.values()).filter((p) => p.batches.length > 0)
      )
    }
  }, [products, receivedBatches])

  // Chargement des statistiques
  useEffect(() => {
    if (tabValue === 2) {
      fetchSalesStatistics(selectedYear, selectedMonth, selectedProductId)
    }
  }, [
    fetchSalesStatistics,
    selectedYear,
    selectedMonth,
    selectedProductId,
    tabValue,
  ])

  // Ajouter un nouvel effet pour capturer tous les produits uniques la première fois que les statistiques sont chargées
  useEffect(() => {
    if (salesStatistics.length > 0 && allUniqueProducts.length === 0) {
      const productMap = new Map<
        string,
        { productId: number; productName: string }
      >()
      salesStatistics.forEach((stat) => {
        if (!productMap.has(stat.productName)) {
          productMap.set(stat.productName, {
            productId: stat.productId,
            productName: stat.productName,
          })
        }
      })

      const sortedProducts = Array.from(productMap.values()).sort((a, b) =>
        a.productName.localeCompare(b.productName)
      )

      setAllUniqueProducts(sortedProducts)
    }
  }, [salesStatistics, allUniqueProducts])

  // Calculer les totaux pour les métriques
  const totalReceived = salesStatistics.reduce(
    (sum, stat) => sum + (stat.receivedQuantity || 0),
    0
  )
  const totalSold = salesStatistics.reduce(
    (sum, stat) => sum + (stat.soldQuantity || 0),
    0
  )
  const totalReserved = salesStatistics.reduce(
    (sum, stat) => sum + (stat.reservedQuantity || 0),
    0
  )
  const totalRevenue = salesStatistics.reduce(
    (sum, stat) => sum + (stat.totalRevenue || 0),
    0
  )
  const totalPotentialRevenue = salesStatistics.reduce(
    (sum, stat) => sum + (stat.potentialRevenue || 0),
    0
  )

  // Grouper les statistiques par type de produit
  const statsByProductType = salesStatistics.reduce(
    (acc, stat) => {
      const key = stat.productType
      if (!acc[key]) {
        acc[key] = {
          productType: key,
          receivedQuantity: 0,
          soldQuantity: 0,
          reservedQuantity: 0,
          totalRevenue: 0,
          potentialRevenue: 0,
        }
      }
      acc[key].receivedQuantity += stat.receivedQuantity || 0
      acc[key].soldQuantity += stat.soldQuantity || 0
      acc[key].reservedQuantity += stat.reservedQuantity || 0
      acc[key].totalRevenue += stat.totalRevenue || 0
      acc[key].potentialRevenue += stat.potentialRevenue || 0
      return acc
    },
    {} as Record<
      string,
      {
        productType: string
        receivedQuantity: number
        soldQuantity: number
        reservedQuantity: number
        totalRevenue: number
        potentialRevenue: number
      }
    >
  )

  const renderBatchesByStatus = (statusTabIndex: number) => {
    try {
      const filteredBatches = allBatches
        .map(getSafeBatch) // Nettoyage supplémentaire par sécurité
        .filter((batch) => {
          const status = batch.status?.toUpperCase()
          const isOutOfStock = batch.availableQuantity === 0

          switch (statusTabIndex) {
            case 0:
              return true // Tous
            case 1:
              return status === 'PENDING' && !isOutOfStock
            case 2:
              return status === 'REJECTED' && !isOutOfStock
            case 3:
              return status === 'APPROVED' && !isOutOfStock
            case 4:
              return status === 'RECEIVED' && !isOutOfStock
            case 5:
              return isOutOfStock
            default:
              return true
          }
        })

      if (isBatchesLoading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )
      }

      if (batchesError) {
        return (
          <Alert severity="error" sx={{ m: 2 }}>
            {batchesError}
          </Alert>
        )
      }

      if (filteredBatches.length === 0) {
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Aucun lot dans cette catégorie.
            </Typography>
          </Box>
        )
      }

      return (
        <Grid container spacing={3}>
          {filteredBatches.map((batch) => {
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
                        sx={{ mr: 1 }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        <strong>Disponible:</strong>{' '}
                        {formatSafeDate(batch.availabilityDate, 'dd MMMM yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Quantité:</strong> {batch.availableQuantity}{' '}
                        {batch.unitType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Prix:</strong> {batch.unitPrice.toFixed(2)}€/
                        {batch.unitType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Producteur:</strong> {batch.producerName}
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
                        {formatSafeDate(batch.createdAt, 'dd/MM/yyyy')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )
    } catch (error) {
      console.error('Erreur dans le rendu des lots:', error)
      setGlobalError(
        "Une erreur s'est produite lors de l'affichage des lots. Veuillez réessayer."
      )
      return null
    }
  }

  if (globalError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ m: 2 }}>
          {globalError}
          <Button
            sx={{ ml: 2 }}
            variant="outlined"
            onClick={() => setGlobalError(null)}
          >
            Réessayer
          </Button>
        </Alert>
      </Container>
    )
  }

  if (productsLoading || batchesLoading || statsLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (productsError || batchContextError || statsError || error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {productsError || batchContextError || statsError || error}
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
        Dashboard Gestionnaire
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="manager dashboard tabs"
        >
          <Tab label="Produits en Stock" {...a11yProps(0)} />
          <Tab label="Tous les Lots" {...a11yProps(1)} />
          <Tab label="Statistiques des Ventes" {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Onglet des produits en stock */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>
          Produits en vente en Stock
        </Typography>

        {productsWithBatches.length === 0 ? (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Aucun produit en vente disponible actuellement
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
                        {product.description ||
                          'Aucune description disponible.'}
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
                                  {formatSafeDate(
                                    batch.availabilityDate,
                                    'dd MMM yyyy'
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
      </TabPanel>

      {/* Onglet des lots */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Tous les Lots des Producteurs
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={batchStatusTabValue}
            onChange={handleBatchStatusTabChange}
            aria-label="batch status tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Tous" {...a11yProps(0)} />
            <Tab label="En attente" {...a11yProps(1)} />
            <Tab label="Refusé" {...a11yProps(2)} />
            <Tab label="Accepté" {...a11yProps(3)} />
            <Tab label="En vente" {...a11yProps(4)} />
            <Tab label="Épuisé" {...a11yProps(5)} />
          </Tabs>
        </Box>

        {/* Contenu pour chaque sous-onglet */}
        {[0, 1, 2, 3, 4, 5].map((statusTabIndex) => (
          <TabPanel
            key={statusTabIndex}
            value={batchStatusTabValue}
            index={statusTabIndex}
          >
            {renderBatchesByStatus(statusTabIndex)}
          </TabPanel>
        ))}
      </TabPanel>

      {/* Onglet des statistiques de ventes */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>
          Tableau de Bord des Ventes
        </Typography>

        {/* Filtres */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Sélecteur de produit */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="product-select-label">Produit</InputLabel>
              <Select
                labelId="product-select-label"
                value={selectedProductId || ''}
                label="Produit"
                onChange={handleProductChange}
              >
                <MenuItem value="">Tous les produits</MenuItem>
                {allUniqueProducts.map((product) => (
                  <MenuItem key={product.productId} value={product.productId}>
                    {product.productName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sélecteur d'année */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="year-select-label">Année</InputLabel>
              <Select
                labelId="year-select-label"
                value={selectedYear || ''}
                label="Année"
                onChange={handleYearChange}
              >
                <MenuItem value="">Toutes les années</MenuItem>
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sélecteur de mois */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="month-select-label">Mois</InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth || ''}
                label="Mois"
                onChange={handleMonthChange}
                disabled={!selectedYear}
              >
                <MenuItem value="">Tous les mois</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Affichage du titre avec le produit sélectionné */}
        {selectedProductId && (
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            Statistiques pour:{' '}
            {products.find((p) => p.productId === selectedProductId)
              ?.productName || 'Produit sélectionné'}
          </Typography>
        )}

        {/* Cartes récapitulatives */}
        <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Unités Reçues (Total)
                </Typography>
                <Typography variant="h3">{totalReceived}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  En stock disponible:{' '}
                  {totalReceived - totalSold - totalReserved} unités
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Unités Vendues
                </Typography>
                <Typography variant="h3">{totalSold}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {totalReceived > 0
                    ? ((totalSold / totalReceived) * 100).toFixed(1)
                    : '0.0'}
                  % du stock reçu
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Unités Réservées
                </Typography>
                <Typography variant="h3">{totalReserved}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {totalReceived > 0
                    ? ((totalReserved / totalReceived) * 100).toFixed(1)
                    : '0.0'}
                  % du stock reçu
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Revenu Total
                </Typography>
                <Typography variant="h3">
                  {totalRevenue.toFixed(2)} €
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Prix moyen:{' '}
                  {totalSold > 0
                    ? (totalRevenue / totalSold).toFixed(2)
                    : '0.00'}{' '}
                  €/unité
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card raised>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Revenu Potentiel
                </Typography>
                <Typography variant="h3">
                  {totalPotentialRevenue.toFixed(2)} €
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {totalRevenue > 0
                    ? `+${((totalPotentialRevenue / totalRevenue) * 100).toFixed(1)}%`
                    : '100%'}{' '}
                  du revenu actuel
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tableau statistique par type de produit */}
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Statistiques par Type de Produit
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type de Produit</TableCell>
                  <TableCell align="right">Unités Reçues</TableCell>
                  <TableCell align="right">Unités Vendues</TableCell>
                  <TableCell align="right">Unités Réservées</TableCell>
                  <TableCell align="right">Stock Disponible</TableCell>
                  <TableCell align="right">Taux d'Occupation</TableCell>
                  <TableCell align="right">Revenu</TableCell>
                  <TableCell align="right">Revenu Potentiel</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(statsByProductType).map((stat) => (
                  <TableRow key={stat.productType}>
                    <TableCell>{stat.productType}</TableCell>
                    <TableCell align="right">{stat.receivedQuantity}</TableCell>
                    <TableCell align="right">{stat.soldQuantity}</TableCell>
                    <TableCell align="right">{stat.reservedQuantity}</TableCell>
                    <TableCell align="right">
                      {stat.receivedQuantity -
                        stat.soldQuantity -
                        stat.reservedQuantity >
                      0
                        ? stat.receivedQuantity -
                          stat.soldQuantity -
                          stat.reservedQuantity
                        : 0}
                    </TableCell>
                    <TableCell align="right">
                      {stat.receivedQuantity > 0 ? (
                        <Box display="flex" alignItems="center">
                          <Box width="100%" mr={1}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(
                                ((stat.soldQuantity + stat.reservedQuantity) /
                                  stat.receivedQuantity) *
                                  100,
                                100
                              )}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor:
                                    (stat.soldQuantity +
                                      stat.reservedQuantity) /
                                      stat.receivedQuantity >
                                    0.8
                                      ? 'success.main'
                                      : 'warning.main',
                                },
                              }}
                            />
                          </Box>
                          <Box minWidth={35}>
                            {Math.round(
                              ((stat.soldQuantity + stat.reservedQuantity) /
                                stat.receivedQuantity) *
                                100
                            )}
                            %
                          </Box>
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {stat.totalRevenue.toFixed(2)} €
                    </TableCell>
                    <TableCell align="right">
                      {(stat.totalRevenue + stat.potentialRevenue).toFixed(2)} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Tableau détaillé par produit */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Détails par Produit
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produit</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Reçu</TableCell>
                  <TableCell align="right">Vendu</TableCell>
                  <TableCell align="right">Réservé</TableCell>
                  <TableCell align="right">Disponible</TableCell>
                  <TableCell>Unité</TableCell>
                  <TableCell align="right">Revenu</TableCell>
                  <TableCell align="right">Prévision</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesStatistics.map((stat, index) => {
                  const available = Math.max(
                    0,
                    (stat.receivedQuantity || 0) -
                      (stat.soldQuantity || 0) -
                      (stat.reservedQuantity || 0)
                  )

                  return (
                    <TableRow key={index}>
                      <TableCell>{stat.productName}</TableCell>
                      <TableCell>{stat.productType}</TableCell>
                      <TableCell align="right">
                        {stat.receivedQuantity || 0}
                      </TableCell>
                      <TableCell align="right">
                        {stat.soldQuantity || 0}
                      </TableCell>
                      <TableCell align="right">
                        {stat.reservedQuantity || 0}
                      </TableCell>
                      <TableCell align="right">{available}</TableCell>
                      <TableCell>{stat.unitType}</TableCell>
                      <TableCell align="right">
                        {(stat.totalRevenue || 0).toFixed(2)} €
                      </TableCell>
                      <TableCell align="right">
                        {(stat.potentialRevenue || 0).toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Container>
  )
}

export default ManagerDashboardPage
