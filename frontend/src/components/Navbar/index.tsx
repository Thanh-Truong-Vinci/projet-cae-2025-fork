import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { Button, Box } from '@mui/material'
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
    <Box sx={{ display: 'flex', gap: 1 }} data-testid="navbar-component">
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
            S'inscrire
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
            Se connecter
          </Button>
        </>
      )}
    </Box>
  )
}

export default NavBar
