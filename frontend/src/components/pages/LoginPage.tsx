import { useState, SyntheticEvent, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  useTheme,
  Typography,
} from '@mui/material'
import { UserContextType, User, AuthenticatedUser } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import './index.css'

const LoginPage = () => {
  const { loginUser } = useContext<UserContextType>(UserContext)
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const theme = useTheme()

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    const user: User = { login, password }
    try {
      const authenticatedUser: AuthenticatedUser = await loginUser(user)
      if (rememberMe && authenticatedUser) {
        document.cookie = `token=${authenticatedUser.token}; path=/; max-age=31536000` // 1 year
      }
      navigate('/')
    } catch (err) {
      console.error('LoginPage::error: ', err)
    }
  }

  const handleLoginChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement
    setLogin(input.value)
  }

  const handlePasswordChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement
    setPassword(input.value)
  }

  const handleRememberMeChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement
    setRememberMe(input.checked)
  }

  return (
    <Box
      sx={{
        margin: 2,
        padding: 3,
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        borderRadius: 4,
        boxShadow: 2,
      }}
    >
      <Typography variant="h4" align="center" color="success" gutterBottom>
        Se connecter
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            id="login"
            name="login"
            label="Email ou Login"
            variant="outlined"
            value={login}
            onChange={handleLoginChange}
            required
            color="primary"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
            }}
          />
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            required
            color="primary"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
            }}
          />
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                color="primary"
              />
            }
            label="Se souvenir de moi"
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          S'authentifier
        </Button>
      </form>
    </Box>
  )
}

export default LoginPage
