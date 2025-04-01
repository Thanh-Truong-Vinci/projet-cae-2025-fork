import { AppBar, Toolbar, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import NavBar from '../Navbar'
import { useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { UserContextType } from '../../types'

interface HeaderProps {
  title: string
}

const Header = ({ title }: HeaderProps) => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext)
  const navigate = useNavigate()

  const handleTitleClick = () => {
    if (authenticatedUser) {
      if (authenticatedUser.role === 'Producer') {
        navigate('/producer-dashboard')
      } else if (authenticatedUser.role === 'Manager') {
        navigate('/manager-dashboard')
      } else {
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <Toolbar sx={{ flexWrap: 'wrap' }}>
        <Typography
          variant="h6"
          color="inherit"
          noWrap
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            color: 'green',
          }}
          onClick={handleTitleClick}
          data-testid="title"
        >
          {title}
        </Typography>

        <NavBar />
      </Toolbar>
    </AppBar>
  )
}

export default Header
