// Modifiez App/index.tsx
import { Outlet } from 'react-router-dom'
import Footer from '../Footer'
import Header from '../Header'
import Box from '@mui/material/Box'
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
        backgroundColor: '#f5f5f5',
      }}
    >
      <Header title="Terroir & Cie" />
      <Box component="main" sx={{ flex: '1', display: 'flex' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}

export default App