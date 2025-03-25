import { useState, SyntheticEvent, useContext } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  useTheme,
  Typography,
} from '@mui/material'
import { UserContextType, LoginUser, AuthenticatedUser } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import './index.css'

const LoginPage = () => {
  const { loginUser } = useContext<UserContextType>(UserContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const theme = useTheme()

  // Extract returnTo path from location state if it exists
  const returnTo = location.state?.returnTo || '/'

  // When login is successful
  const handleLoginSuccess = () => {
    // Redirect the user back to where they came from
    navigate(returnTo)
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    const user: LoginUser = { email, password }
    try {
      setErrorMessage(null)
      const authenticatedUser: AuthenticatedUser = await loginUser(user)
      if (rememberMe && authenticatedUser) {
        document.cookie = `token=${authenticatedUser.token}; path=/; max-age=31536000` // 1 year
      }
      handleLoginSuccess()
    } catch (err) {
      console.error('LoginPage::error: ', err)
      setErrorMessage('Email ou mot de passe incorrect.')
    }
  }

  const handleLoginChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement
    setEmail(input.value)
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
      className="login-form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        maxWidth: 600,
        margin: 'auto',
        mt: 3,
        mb: 3,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          padding: '16px',
          borderRadius: '8px',
          width: '100%',
        }}
      >
        <Typography variant="h4" align="center" color="primary" gutterBottom>
          Se connecter
        </Typography>

        {errorMessage && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error" variant="subtitle2" align="center">
              {errorMessage}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email ou Login"
          variant="outlined"
          value={email}
          onChange={handleLoginChange}
          required
          color="primary"
          data-testid="email-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 2,
          }}
          error={!!errorMessage}
        />

        <TextField
          fullWidth
          id="password"
          name="password"
          label="Mot de passe"
          type="password"
          variant="outlined"
          value={password}
          onChange={handlePasswordChange}
          required
          color="primary"
          data-testid="password-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 2,
          }}
          error={!!errorMessage}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={handleRememberMeChange}
              color="primary"
            />
          }
          label="Se souvenir de moi"
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
        >
          S'authentifier
        </Button>

        <Button
          component={Link}
          to="/register"
          variant="contained"
          color="primary"
          fullWidth
        >
          Pas de compte ? Inscrivez-vous
        </Button>
      </form>
    </Box>
  )
}

export default LoginPage
