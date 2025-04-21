import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { Button, Box, IconButton } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AddBoxIcon from '@mui/icons-material/AddBox'
import PersonIcon from '@mui/icons-material/Person'
import AssignmentIcon from '@mui/icons-material/Assignment'
import LogoutIcon from '@mui/icons-material/Logout'
import { Link } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'
import { UserContextType } from '../../types'

const NavBar = () => {
  const { authenticatedUser, clearUser } =
    useContext<UserContextType>(UserContext)
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
            <ShoppingCartIcon sx={{ color: 'green' }} />
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
            onClick={() => navigate('/manage-product-types')}
          >
            Gérer les Types
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
            component={Link}
            to="/pending-batches"
            startIcon={<AssignmentIcon />}
          >
            Lots en attente
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
      <IconButton
        onClick={handleLogout}
        aria-label="se-déconnecter"
        sx={{ color: 'red' }}
      >
        <LogoutIcon />
      </IconButton>
    </Box>
  )
}

export default NavBar
