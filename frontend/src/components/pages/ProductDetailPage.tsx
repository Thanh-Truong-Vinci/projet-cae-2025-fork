import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CartContext } from '../../contexts/CartContext';

// Définir l'interface pour un produit (à terme, celle-ci devrait être partagée)
interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description?: string;
  details?: {
    [key: string]: string;
  };
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simuler une requête API pour obtenir les détails du produit
    // À terme, ceci devrait être une vraie requête vers votre API
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Simuler un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simuler des données de produit
        const mockProduct: Product = {
          id: Number(productId),
          name: `Produit ${productId}`,
          price: `${10 + Number(productId)}€`,
          image: "https://via.placeholder.com/600x400",
          description: "Ce produit de qualité supérieure est cultivé localement selon des méthodes respectueuses de l'environnement. Sa fraîcheur exceptionnelle et son goût incomparable en font un incontournable de votre cuisine. Idéal pour la préparation de plats savoureux et nutritifs, il saura satisfaire les palais les plus exigeants.",
          details: {
            "Origine": "Belgique",
            "Catégorie": "Type 1",
            "Conditionnement": "500g",
            "Conservation": "À conserver au frais"
          }
        };
        
        setProduct(mockProduct);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les détails du produit");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
      // Vous pourriez aussi rediriger vers le panier ou afficher une notification
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5 }}>
        <Typography variant="h6" color="error">{error || "Produit non trouvé"}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
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
                objectFit: 'cover'
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
            
            {/* Détails du produit */}
            {product.details && Object.entries(product.details).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>{key}:</Typography>
                <Typography variant="body1">{value}</Typography>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Sélecteur de quantité */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>Quantité:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 1 }}>
                <IconButton 
                  onClick={() => handleQuantityChange(-1)}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 2, minWidth: '30px', textAlign: 'center' }}>
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
  );
};

export default ProductDetailPage;