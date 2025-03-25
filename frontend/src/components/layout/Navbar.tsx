import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { Link, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { CartContext } from '../../contexts/CartContext'
import { UserContext } from '../../contexts/UserContext'

const Navbar = () => {
  const { cartItems } = useContext(CartContext)
  const { authenticatedUser } = useContext(UserContext)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    // Vérifier via le contexte et localStorage
    const userFromStorage = localStorage.getItem('authenticatedUser')
    setIsLoggedIn(!!authenticatedUser || !!userFromStorage)
  }, [authenticatedUser])

  const logoutUser = () => {
    // Clear user authentication data
    localStorage.removeItem('authenticatedUser')
    setIsLoggedIn(false)
    // Redirect to the login page
    navigate('/login')
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: '#2E7D32' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}
        >
          E-Commerce
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Navigation links */}
          <Button color="inherit" component={Link} to="/">
            Accueil
          </Button>
          <Button color="inherit" component={Link} to="/products">
            Produits
          </Button>

          {/* Mes réservations - affiché pour les utilisateurs connectés */}
          {isLoggedIn && (
            <Button
              color="inherit"
              component={Link}
              to="/reservations"
              sx={{ mr: 1 }}
            >
              Mes réservations
            </Button>
          )}

          {/* Panier avec badge */}
          <IconButton
            color="inherit"
            onClick={() => navigate('/cart')}
            aria-label="Panier"
          >
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {/* Connexion/Profil */}
          {isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                onClick={() => logoutUser()}
                sx={{ ml: 1 }}
              >
                Déconnexion
              </Button>
              <IconButton color="inherit" onClick={() => navigate('/profile')}>
                <AccountCircleIcon />
              </IconButton>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Connexion
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
