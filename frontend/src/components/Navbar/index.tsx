import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { Button, Box, IconButton, Badge } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
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

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }} data-testid="navbar-component">
      <IconButton 
        onClick={() => navigate('/cart')}
        sx={{ mr: 1 }}
        aria-label="panier"
      >
        <Badge badgeContent={0} color="error">
          <ShoppingCartIcon sx={{ color: 'green' }} />
        </Badge>
      </IconButton>

      {authenticatedUser ? (
        <>
          <Button variant="outlined" color="inherit" onClick={handleLogout}>
            Se déconnecter
          </Button>
        </>
      ) : (
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
        </>
      )}
    </Box>
  )
}

export default NavBar
