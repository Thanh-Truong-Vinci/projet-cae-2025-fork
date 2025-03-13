import { Box, Typography } from '@mui/material'
import NavBar from '../Navbar'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
}

const Header = ({ title }: HeaderProps) => {
  const navigate = useNavigate()

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
      }}
    >
      {/* Titre aligné à gauche et cliquable */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 'bold',
          cursor: 'pointer',
          '&:hover': {
            color: 'primary.main',
          },
        }}
        onClick={() => navigate('/')}
      >
        {title}
      </Typography>

      {/* Navbar alignée à droite */}
      <NavBar />
    </Box>
  )
}

export default Header
