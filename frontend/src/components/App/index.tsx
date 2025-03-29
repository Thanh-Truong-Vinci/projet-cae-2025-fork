import { Outlet } from 'react-router-dom'
import Footer from '../Footer'
import Header from '../Header'
import Box from '@mui/material/Box'
import { useContext, useEffect, useState, useRef } from 'react'
import { UserContextType } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import { getAuthenticatedUser } from '../../utils/session'

const App = () => {
  const { authsMe } = useContext<UserContextType>(UserContext)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  // Use a ref to prevent multiple token validations
  const tokenValidationDone = useRef(false)

  useEffect(() => {
    // Only validate token once per page load
    if (tokenValidationDone.current) return

    const validateToken = async () => {
      setIsValidatingToken(true)
      const savedUser = getAuthenticatedUser()
      if (savedUser?.token) {
        try {
          console.log('Validating stored token...')
          await authsMe(savedUser.token)
          console.log('Token validation successful')
        } catch (error) {
          console.error('Token validation failed:', error)
        }
      } else {
        console.log('No stored authentication token found')
      }
      setIsValidatingToken(false)
      tokenValidationDone.current = true
    }

    validateToken()
  }, [authsMe]) // Keep authsMe in dependencies to satisfy React

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
      {isValidatingToken ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}
        >
          {/* You could add a loading indicator here if desired */}
        </Box>
      ) : (
        <Box
          component="main"
          sx={{ flex: '1', display: 'flex', width: '100%' }}
        >
          <Outlet />
        </Box>
      )}
      <Footer />
    </Box>
  )
}

export default App
