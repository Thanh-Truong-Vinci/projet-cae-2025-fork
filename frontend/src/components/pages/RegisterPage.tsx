import { useState, SyntheticEvent, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  MenuItem,
} from '@mui/material'
import { UserContextType } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import './index.css'

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext)
  const navigate = useNavigate()
  const theme = useTheme()

  const [formData, setFormData] = useState({
    name: '',
    firstname: '',
    civility: '',
    street: '',
    number: '',
    box: '',
    postalCode: '',
    city: '',
    country: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorPasword, setErrorPasword] = useState<string | null>(null)
  const [errorConfirmPasword, setErrorConfirmPasword] = useState<string | null>(
    null
  )

  const handleChange = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData, [target.name]: target.value })
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    /*
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!passwordRegex.test(formData.password)) {
      setErrorEmail(null)
      setErrorConfirmPasword(null)
      setErrorPasword(
        'Le mot de passe doit contenir au moins 8 caractères, une lettre, un chiffre et un caractère spécial.'
      )
      return
    }
      */
    if (formData.password !== formData.confirmPassword) {
      setErrorEmail(null)
      setErrorConfirmPasword('Les mots de passe ne correspondent pas.')
      setErrorPasword(null)
      return
    }

    try {
      await registerUser({
        name: formData.name,
        firstname: formData.firstname,
        civility: formData.civility,
        street: formData.street,
        number: formData.number,
        box: formData.box,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
      })
      navigate('/login')
    } catch (err) {
      console.error('RegisterPage::error: ', err)
      setErrorEmail('Cette adresse email est déjà utilisée.')
      setErrorPasword(null)
      setErrorConfirmPasword(null)
    }
  }

  return (
    <Box className="register-form" sx={{ maxWidth: 1000, margin: 'auto' }}>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        S'inscrire
      </Typography>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          padding: '16px',
          borderRadius: '8px',
        }}
      >
        <TextField
          fullWidth
          id="name"
          name="name"
          label="Name"
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          required
          color="primary"
          data-testid="name-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
        />
        <TextField
          fullWidth
          id="firstname"
          name="firstname"
          label="First name"
          variant="outlined"
          value={formData.firstname}
          onChange={handleChange}
          required
          color="primary"
          data-testid="firstname-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
        />
        <TextField
          select
          fullWidth
          id="civility"
          name="civility"
          label="Civility"
          variant="outlined"
          value={formData.civility}
          onChange={handleChange}
          required
          color="primary"
          data-testid="civility-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
        >
          <MenuItem value="Monsieur">Monsieur</MenuItem>
          <MenuItem value="Madame">Madame</MenuItem>
        </TextField>
        <TextField
          fullWidth
          id="street"
          name="street"
          label="Street"
          variant="outlined"
          value={formData.street}
          onChange={handleChange}
          required
          color="primary"
          data-testid="street-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
        />
        <TextField
          fullWidth
          id="number"
          name="number"
          label="Number"
          variant="outlined"
          value={formData.number}
          onChange={handleChange}
          required
          color="primary"
          data-testid="number-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            id="box"
            name="box"
            label="Box"
            variant="outlined"
            value={formData.box}
            onChange={handleChange}
            color="primary"
            data-testid="box-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
          />
          <TextField
            fullWidth
            id="postalCode"
            name="postalCode"
            label="Postal code"
            variant="outlined"
            value={formData.postalCode}
            onChange={handleChange}
            required
            color="primary"
            data-testid="postalCode-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            id="city"
            name="city"
            label="City"
            variant="outlined"
            value={formData.city}
            onChange={handleChange}
            required
            color="primary"
            data-testid="city-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
          />
          <TextField
            fullWidth
            id="country"
            name="country"
            label="Country"
            variant="outlined"
            value={formData.country}
            onChange={handleChange}
            required
            color="primary"
            data-testid="country-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
          />
        </Box>

        <TextField
          fullWidth
          id="phoneNumber"
          name="phoneNumber"
          label="Phone number"
          variant="outlined"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
          color="primary"
          data-testid="phoneNumber-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
        />
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          type="email"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          required
          color="primary"
          data-testid="email-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={!!errorEmail}
          helperText={errorEmail}
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type="password"
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
          required
          color="primary"
          data-testid="password-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={!!errorPasword}
          helperText={errorPasword}
        />
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type="password"
          variant="outlined"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          color="primary"
          data-testid="confirmPassword-input"
          sx={{ input: { color: theme.palette.secondary.contrastText }, mb: 1 }}
          error={!!errorConfirmPasword}
          helperText={errorConfirmPasword}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
        >
          S'inscrire
        </Button>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="primary"
          fullWidth
        >
          Vous avez un compte ? Connectez vous
        </Button>
      </form>
    </Box>
  )
}

export default RegisterPage
