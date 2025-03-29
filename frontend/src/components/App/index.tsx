import { Outlet, useNavigate } from 'react-router-dom'
import Footer from '../Footer'
import Header from '../Header'
import Box from '@mui/material/Box'
import { useContext, useEffect } from 'react'
import { UserContextType } from '../../types'
import { UserContext } from '../../contexts/UserContext'

const App = () => {
  const { authenticatedUser, authsMe } =
    useContext<UserContextType>(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('UseEffect')
    const validateToken = async () => {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
      if (token) {
        const tokenValue = token.split('=')[1]
        await authsMe(tokenValue)
      }
    }

    validateToken()
  }, [authsMe])

  // Rediriger les producteurs et les managers vers leurs dashboards respectifs
  useEffect(() => {
    if (authenticatedUser) {
      // Vérifier si nous sommes déjà sur la page d'accueil
      const isHomePage =
        window.location.pathname === '/' || window.location.pathname === ''

      if (isHomePage) {
        if (authenticatedUser.role === 'Producer') {
          navigate('/producer-dashboard')
        } else if (authenticatedUser.role === 'Manager') {
          navigate('/manager-dashboard')
        }
      }
    }
  }, [authenticatedUser, navigate])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Header title="Terroir & Cie" />
      <Box component="main" sx={{ flex: '1', display: 'flex', width: '100%' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}

export default App
