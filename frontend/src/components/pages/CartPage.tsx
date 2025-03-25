import { useContext } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { CartContext } from '../../contexts/CartContext'

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useContext(CartContext)

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price.replace('€', '')) * item.quantity,
      0
    )
  }

  const handleQuantityChange = (id: number, value: string) => {
    const quantity = parseInt(value)
    if (quantity > 0) {
      updateQuantity(id, quantity)
    }
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Mon Panier</Typography>

      {cartItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6">Votre panier est vide</Typography>
          <Button 
            variant="contained" 
            color="success" 
            sx={{ mt: 2 }}
            onClick={() => window.history.back()}
          >
            Continuer vos achats
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Produit</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell align="right">Prix unitaire</TableCell>
                  <TableCell align="right">Quantité</TableCell>
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
                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.price}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        inputProps={{ min: 1 }}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {`${(Number(item.price.replace('€', '')) * item.quantity).toFixed(2)}€`}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => removeFromCart(item.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              color="error"
              onClick={clearCart}
            >
              Vider le panier
            </Button>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6">
                Total: {calculateTotal().toFixed(2)}€
              </Typography>
              <Button 
                variant="contained" 
                color="success"
                sx={{ mt: 2 }}
              >
                Procéder au paiement
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export default CartPage