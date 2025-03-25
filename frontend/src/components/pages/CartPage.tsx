import { useContext } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { CartContext } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price.replace('€', '')) * item.quantity,
      0
    );
  };

  const handleQuantityChange = (id: number, change: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      updateQuantity(id, newQuantity);
    }
  };

  const handleDirectQuantityChange = (id: number, value: string) => {
    const quantity = parseInt(value);
    if (quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Mon Panier</Typography>

      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Votre panier est vide</Typography>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => navigate('/')}
          >
            Continuer vos achats
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Produit</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell align="right">Prix unitaire</TableCell>
                  <TableCell align="center">Quantité</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: 60, height: 60, objectFit: 'cover' }} 
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.price}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleDirectQuantityChange(item.id, e.target.value)}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          sx={{ width: 60, mx: 1 }}
                          size="small"
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {`${(Number(item.price.replace('€', '')) * item.quantity).toFixed(2)}€`}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, alignItems: 'center' }}>
            <Box>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={clearCart}
                sx={{ mr: 2 }}
              >
                Vider le panier
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/')}
              >
                Continuer vos achats
              </Button>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                Total: {calculateTotal().toFixed(2)}€
              </Typography>
              <Button 
                variant="contained" 
                color="success" 
                sx={{ mt: 2 }}
              >
                Réserver
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CartPage;