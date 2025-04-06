import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { Button, Box, IconButton, Badge } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AddBoxIcon from '@mui/icons-material/AddBox'
import PersonIcon from '@mui/icons-material/Person'
import { UserContext } from '../../contexts/UserContext'
import { UserContextType } from '../../types'
import { CartContext } from '../../contexts/CartContext'

const NavBar = () => {
  const { authenticatedUser, clearUser } =
    useContext<UserContextType>(UserContext)
  const { getCartCount } = useContext(CartContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; max-age=-1'
    clearUser()
  }

  // Si l'utilisateur n'est pas connecté
  if (!authenticatedUser) {
    return (
      <Box
        sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
        data-testid="navbar-component"
      >
        <Button
          variant="outlined"
          sx={{
            color: 'green',
            borderColor: 'green',
            '&:hover': {
              borderColor: 'darkgreen',
              backgroundColor: 'rgba(0, 128, 0, 0.04)',
            },
            mr: 1,
          }}
          onClick={() => navigate('/register')}
        >
          Inscription
        </Button>
        <Button
          variant="outlined"
          sx={{
            color: 'green',
            borderColor: 'green',
            '&:hover': {
              borderColor: 'darkgreen',
              backgroundColor: 'rgba(0, 128, 0, 0.04)',
            },
          }}
          onClick={() => navigate('/login')}
        >
          Connexion
        </Button>
      </Box>
    )
  }

  // Si l'utilisateur est connecté, affichage selon le rôle
  return (
    <Box
      sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
      data-testid="navbar-component"
    >
      {/* Client: Cart + Réservations */}
      {authenticatedUser.role === 'Client' && (
        <>
          <IconButton
            onClick={() => navigate('/cart')}
            sx={{ mr: 1 }}
            aria-label="panier"
          >
            <Badge badgeContent={getCartCount()} color="error">
              <ShoppingCartIcon sx={{ color: 'green' }} />
            </Badge>
          </IconButton>
          <IconButton
            onClick={() => navigate('/reservations')}
            sx={{ mr: 1 }}
            aria-label="réservations"
          >
            <ReceiptIcon />
          </IconButton>
        </>
      )}

      {/* Manager: Boutons d'inscription */}
      {authenticatedUser.role === 'Manager' && (
        <>
          <Button
            variant="outlined"
            sx={{
              color: 'green',
              borderColor: 'green',
              '&:hover': {
                borderColor: 'darkgreen',
                backgroundColor: 'rgba(0, 128, 0, 0.04)',
              },
              mr: 1,
            }}
            onClick={() => navigate('/register-manager')}
          >
            Nouveau Gestionnaire
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: 'green',
              borderColor: 'green',
              '&:hover': {
                borderColor: 'darkgreen',
                backgroundColor: 'rgba(0, 128, 0, 0.04)',
              },
              mr: 1,
            }}
            onClick={() => navigate('/register-producer')}
          >
            Nouveau Producteur
          </Button>
        </>
      )}

      {/* Producer: Ajouter lot */}
      {authenticatedUser.role === 'Producer' && (
        <IconButton
          onClick={() => navigate('/add-batch')}
          sx={{ mr: 1 }}
          aria-label="ajouter-lot"
        >
          <AddBoxIcon />
        </IconButton>
      )}

      {/* Profil pour tous les rôles sauf Volunteer */}
      {authenticatedUser.role !== 'Volunteer' && (
        <IconButton
          onClick={() => navigate('/profile')}
          sx={{ mr: 1 }}
          aria-label="profile"
        >
          <PersonIcon />
        </IconButton>
      )}

      {/* Bouton de déconnexion pour tous les utilisateurs authentifiés */}
      <Button variant="outlined" color="inherit" onClick={handleLogout}>
        Se déconnecter
      </Button>
    </Box>
  )
}

export default NavBar
