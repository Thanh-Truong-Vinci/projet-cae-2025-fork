import { useState, useEffect, useContext } from 'react';
import { Typography, Box, TextField, Select, MenuItem, Button } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { CartContext } from '../../contexts/CartContext';

const HomePage = () => {
  const [type, setType] = useState('');
  const [productName, setProductName] = useState('');
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState(10);
  const { addToCart } = useContext(CartContext);
  const productsPerRow = 5;
  const productsPerLoad = productsPerRow * 2;

  const topProducts = [
    { id: 1, name: "Produit 1", price: "10€", image: "https://via.placeholder.com/300x200" },
    { id: 2, name: "Produit 2", price: "20€", image: "https://via.placeholder.com/300x200" },
    { id: 3, name: "Produit 3", price: "30€", image: "https://via.placeholder.com/300x200" }
  ];

  const products = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    name: `Produit ${i + 1}`,
    price: `${10 + i}€`,
    image: "https://via.placeholder.com/300"
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) => (prevIndex + 1) % topProducts.length);
    }, 8000); // Transition plus lente (8 secondes au lieu de 4)
    return () => clearInterval(interval);
  }, [topProducts.length]);

  const handleFilter = () => {
    console.log("Filtrage avec:", type, productName);
  };

  interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Carrousel des produits les plus vendus */}
      <Box sx={{ width: '100%', backgroundColor: '#ddd', p: 5, textAlign: 'center' }}>
        <Typography variant="h5">Produits les plus vendus</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'row',
          justifyContent: 'center', 
          alignItems: 'center',
          mt: 2,
          px: 4
        }}>
          {/* Informations du produit à gauche */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-start',
            justifyContent: 'center',
            pr: 4,
            textAlign: 'left'
          }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{topProducts[currentProductIndex].name}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>Prix: {topProducts[currentProductIndex].price}</Typography>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<AddShoppingCartIcon />}
              onClick={() => handleAddToCart(topProducts[currentProductIndex])}
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
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }} 
            />
          </Box>
        </Box>
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
          >
            <MenuItem value="">Filtrer par type</MenuItem>
            <MenuItem value="type1">Type 1</MenuItem>
            <MenuItem value="type2">Type 2</MenuItem>
          </Select>
          <TextField
            placeholder="Nom du produit"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2, bgcolor: 'white' }}
          />
          <Button variant="contained" color="success" fullWidth onClick={handleFilter}>
            CONFIRMER
          </Button>
        </Box>

        {/* Liste des produits */}
        <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 2, p: 2, justifyContent: 'center' }}>
          {products.slice(0, visibleProducts).map((product, index) => (
            <Box key={index} sx={{ width: 250, height: 350, textAlign: 'center', p: 2, border: '1px solid #ddd', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '60%', objectFit: 'cover', borderRadius: 4 }} />
              <Typography variant="h6">{product.name}</Typography>
              <Typography variant="body1">Prix: {product.price}</Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddShoppingCartIcon />}
                fullWidth
                onClick={() => handleAddToCart(product)}
                sx={{ mt: 1 }}
              >
                Ajouter au panier
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Bouton Voir Plus */}
      {visibleProducts < products.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
          <Button variant="contained" onClick={() => setVisibleProducts((prev) => Math.min(prev + productsPerLoad, products.length))}>
            Voir plus
          </Button>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
          Il n'y a plus de produits à afficher.
        </Typography>
      )}
    </Box>
  );
};

export default HomePage;