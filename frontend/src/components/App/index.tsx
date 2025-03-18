import { Outlet } from 'react-router-dom'
import Footer from '../Footer'
import Header from '../Header'
import Box from '@mui/material/Box'
import pizza from '../../assets/images/pizza.jpg'
import { Container } from '@mui/material'
import { useContext, useEffect } from 'react'
import { UserContextType } from '../../types'
import { UserContext } from '../../contexts/UserContext'

const App = () => {
  const { authsMe } = useContext<UserContextType>(UserContext)

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundImage: `url(${pizza})`,
        backgroundSize: 'cover',
      }}
    >
      <Header title="Terroir & Cie" />
      <Container component="main" sx={{ flex: '1' }}>
        <Outlet />
      </Container>
      <Footer />
    </Box>
  )
}

export default App
