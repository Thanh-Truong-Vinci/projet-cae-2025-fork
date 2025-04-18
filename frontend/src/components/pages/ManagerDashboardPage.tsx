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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ProductContext } from '../../contexts/ProductContext'
import { BatchContext } from '../../contexts/BatchContext'
import { UserContext } from '../../contexts/UserContext'
import { StatisticsContext } from '../../contexts/StatisticsContext'
import { Batch, ProductBatch } from '../../types' // Suppression de l'import SalesStatistics
import { useNavigate } from 'react-router-dom'

interface ProductWithBatches extends ProductBatch {
  batches: Batch[]
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
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
];

const ManagerDashboardPage = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0);

  // Produits et lots
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

  const [productsWithBatches, setProductsWithBatches] = useState<
    ProductWithBatches[]
  >([])

  // Statistiques
  const { salesStatistics, isLoading: statsLoading, error: statsError, fetchSalesStatistics } = useContext(StatisticsContext)!
  const [selectedYear, setSelectedYear] = useState<number | undefined>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  
  // États généraux
  const { authenticatedUser } = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Gestion des onglets
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Générateur d'années pour le filtre (5 dernières années)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Rediriger si non authentifié ou non gestionnaire
  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Manager') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

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
    if (tabValue === 1) {
      fetchSalesStatistics(selectedYear, selectedMonth);
    }
  }, [fetchSalesStatistics, selectedYear, selectedMonth, tabValue]);

  // Calculer les totaux pour les métriques
  const totalReceived = salesStatistics.reduce((sum, stat) => sum + (stat.receivedQuantity || 0), 0);
  const totalSold = salesStatistics.reduce((sum, stat) => sum + (stat.soldQuantity || 0), 0);
  const totalRevenue = salesStatistics.reduce((sum, stat) => sum + (stat.totalRevenue || 0), 0);

  // Gestionnaires d'événements pour les filtres
  const handleYearChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value;
    setSelectedYear(value === '' ? undefined : Number(value));
  };

  const handleMonthChange = (event: SelectChangeEvent<number | ''>) => {
    const value = event.target.value;
    setSelectedMonth(value === '' ? undefined : Number(value));
  };

  // Grouper les statistiques par type de produit
  const statsByProductType = salesStatistics.reduce((acc, stat) => {
    const key = stat.productType;
    if (!acc[key]) {
      acc[key] = {
        productType: key,
        receivedQuantity: 0,
        soldQuantity: 0,
        totalRevenue: 0
      };
    }
    acc[key].receivedQuantity += stat.receivedQuantity || 0;
    acc[key].soldQuantity += stat.soldQuantity || 0;
    acc[key].totalRevenue += stat.totalRevenue || 0;
    return acc;
  }, {} as Record<string, { productType: string; receivedQuantity: number; soldQuantity: number; totalRevenue: number }>);

  if (productsLoading || batchesLoading || statsLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (productsError || batchesError || statsError || error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {productsError || batchesError || statsError || error}
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="manager dashboard tabs">
          <Tab label="Produits en Stock" {...a11yProps(0)} />
          <Tab label="Statistiques des Ventes" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {/* Onglet des produits en stock */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>
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
      </TabPanel>

      {/* Onglet des statistiques de ventes */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Tableau de Bord des Ventes
        </Typography>

        {/* Filtres */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
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

        {/* Cartes récapitulatives */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Unités Reçues
                </Typography>
                <Typography variant="h3">{totalReceived}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Unités Vendues
                </Typography>
                <Typography variant="h3">{totalSold}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card raised>
              <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Revenu Total
                </Typography>
                <Typography variant="h3">{totalRevenue.toFixed(2)} €</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tableau par type de produit */}
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Récapitulatif par Type de Produit
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type de Produit</TableCell>
                  <TableCell align="right">Unités Reçues</TableCell>
                  <TableCell align="right">Unités Vendues</TableCell>
                  <TableCell align="right">Taux de Conversion</TableCell>
                  <TableCell align="right">Revenu Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(statsByProductType).map((stat) => (
                  <TableRow key={stat.productType}>
                    <TableCell>{stat.productType}</TableCell>
                    <TableCell align="right">{stat.receivedQuantity}</TableCell>
                    <TableCell align="right">{stat.soldQuantity}</TableCell>
                    <TableCell align="right">
                      {stat.receivedQuantity > 0
                        ? `${((stat.soldQuantity / stat.receivedQuantity) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="right">{stat.totalRevenue.toFixed(2)} €</TableCell>
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
          {salesStatistics.length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ p: 2 }}>
              Aucune donnée disponible pour cette période
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell align="right">Unités Reçues</TableCell>
                    <TableCell align="right">Unités Vendues</TableCell>
                    <TableCell>Unité</TableCell>
                    <TableCell align="right">Revenu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesStatistics.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>{stat.productName}</TableCell>
                      <TableCell>{stat.productType}</TableCell>
                      <TableCell>
                        {months.find(m => m.value === stat.month)?.label} {stat.year}
                      </TableCell>
                      <TableCell align="right">{stat.receivedQuantity || 0}</TableCell>
                      <TableCell align="right">{stat.soldQuantity || 0}</TableCell>
                      <TableCell>{stat.unitType}</TableCell>
                      <TableCell align="right">{(stat.totalRevenue || 0).toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </TabPanel>
    </Container>
  )
}

export default ManagerDashboardPage
