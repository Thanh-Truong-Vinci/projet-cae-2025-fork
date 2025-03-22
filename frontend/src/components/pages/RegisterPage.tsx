import { useState, SyntheticEvent, useContext, useEffect } from 'react'
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

  const [errorNumber, setErrorNumber] = useState<string | null>(null)
  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorPasword, setErrorPasword] = useState<string | null>(null)
  const [errorConfirmPasword, setErrorConfirmPasword] = useState<string | null>(
    null
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    console.log('fieldErrors state changed:', fieldErrors)
  }, [fieldErrors])

  const handleChange = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    const { name, value } = target

    // Clear the error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }

    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    const requiredFields: (keyof typeof formData)[] = [
      'name',
      'firstname',
      'civility',
      'street',
      'number',
      'postalCode',
      'city',
      'country',
      'phoneNumber',
      'email',
      'password',
      'confirmPassword',
    ]

    // Check each required field more strictly
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = 'Ce champ est requis'
        console.log(`Field ${field} is empty: ${formData[field]}`)
      }
    })

    return errors
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    console.log('Form submitted')

    // Validate all fields first
    const errors = validateForm()
    console.log('Validation errors:', errors)

    // Step 1: Check for empty required fields
    if (Object.keys(errors).length > 0) {
      console.log('Setting field errors:', errors)
      setFieldErrors(errors)
      return // Stop form submission here
    }

    // Add specific validation for number field - digits only
    if (formData.number && !/^\d+$/.test(formData.number)) {
      setErrorNumber('Le numéro doit contenir uniquement des chiffres')
      return
    }

    // Step 2: Check password match
    if (formData.password !== formData.confirmPassword) {
      setErrorEmail(null)
      setErrorConfirmPasword('Les mots de passe ne correspondent pas.')
      setErrorPasword(null)
      return // Stop form submission here
    }

    // Step 3: Check password strength (optional enhancement)
    if (formData.password.length < 8) {
      setErrorPasword('Le mot de passe doit contenir au moins 8 caractères.')
      setErrorConfirmPasword(null)
      setErrorEmail(null)
      return // Stop form submission here
    }

    // Additional email format validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setErrorEmail("Format d'email invalide.")
      setErrorPasword(null)
      setErrorConfirmPasword(null)
      return // Stop form submission here
    }

    // Clear all errors before submitting
    setErrorNumber(null)
    setFieldErrors({})
    setErrorEmail(null)
    setErrorPasword(null)
    setErrorConfirmPasword(null)

    // Only if all validations pass, proceed with submission
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
        {Object.keys(fieldErrors).length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="black" variant="subtitle2" align="center">
              Veuillez remplir tous les champs obligatoires.
            </Typography>
          </Box>
        )}
        <TextField
          fullWidth
          id="name"
          name="name"
          label="Name"
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          color="primary"
          data-testid="name-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={Boolean(fieldErrors.name)}
          helperText={fieldErrors.name || ''}
        />
        <TextField
          fullWidth
          id="firstname"
          name="firstname"
          label="First name"
          variant="outlined"
          value={formData.firstname}
          onChange={handleChange}
          color="primary"
          data-testid="firstname-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={Boolean(fieldErrors.firstname)}
          helperText={fieldErrors.firstname || ''}
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
          color="primary"
          data-testid="civility-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={Boolean(fieldErrors.civility)}
          helperText={fieldErrors.civility || ''}
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
          color="primary"
          data-testid="street-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={Boolean(fieldErrors.street)}
          helperText={fieldErrors.street || ''}
        />
        <TextField
          fullWidth
          id="number"
          name="number"
          label="Number"
          variant="outlined"
          value={formData.number}
          onChange={handleChange}
          color="primary"
          data-testid="number-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={!!errorNumber || Boolean(fieldErrors.number)}
          helperText={errorNumber || fieldErrors.number || ''}
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
            color="primary"
            data-testid="postalCode-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
            error={Boolean(fieldErrors.postalCode)}
            helperText={fieldErrors.postalCode || ''}
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
            color="primary"
            data-testid="city-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
            error={Boolean(fieldErrors.city)}
            helperText={fieldErrors.city || ''}
          />
          <TextField
            fullWidth
            id="country"
            name="country"
            label="Country"
            variant="outlined"
            value={formData.country}
            onChange={handleChange}
            color="primary"
            data-testid="country-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
            error={Boolean(fieldErrors.country)}
            helperText={fieldErrors.country || ''}
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
          color="primary"
          data-testid="phoneNumber-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={Boolean(fieldErrors.phoneNumber)}
          helperText={fieldErrors.phoneNumber || ''}
        />
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
          color="primary"
          data-testid="email-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={!!errorEmail || Boolean(fieldErrors.email)}
          helperText={errorEmail || fieldErrors.email || ''}
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
          color="primary"
          data-testid="password-input"
          sx={{
            input: { color: theme.palette.secondary.contrastText },
            mb: 1,
          }}
          error={!!errorPasword || Boolean(fieldErrors.password)}
          helperText={errorPasword || fieldErrors.password || ''}
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
          color="primary"
          data-testid="confirmPassword-input"
          sx={{ input: { color: theme.palette.secondary.contrastText }, mb: 1 }}
          error={!!errorConfirmPasword || Boolean(fieldErrors.confirmPassword)}
          helperText={errorConfirmPasword || fieldErrors.confirmPassword || ''}
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
