import { Container, Typography, Box } from '@mui/material'
import { useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { UserContextType } from '../../types'

const HomePage = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext)

  return (
    <Container component="main" sx={{ mt: 8, mb: 2, flex: '1' }} maxWidth="sm">
      <Typography variant="h2" component="h1" gutterBottom align="center">
        HomePage
      </Typography>

      {authenticatedUser && (
        <Box
          sx={{
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            padding: 2,
            borderRadius: 2,
            marginBottom: 3,
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Hello dear {authenticatedUser.email}
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default HomePage
