import { useContext, useState, useEffect, SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material'
import { UserContextType } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import './index.css'

const ManagerRegisterPage = () => {
  const { registerManager }: UserContextType = useContext(UserContext)
  const navigate = useNavigate()
  const theme = useTheme()

  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false)

  const [formData, setFormData] = useState({
    name: '',
    firstname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errorEmail, setErrorEmail] = useState<string | null>(null)
  const [errorPassword, setErrorPassword] = useState<string | null>(null)
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<
    string | null
  >(null)
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
      'email',
      'password',
      'confirmPassword',
    ]

    // Check each required field
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = 'Ce champ est requis'
        console.log(`Field ${field} is empty: ${formData[field]}`)
      }
    })

    return errors
  }

  const clearAllErrors = () => {
    setErrorEmail(null)
    setErrorPassword(null)
    setErrorConfirmPassword(null)
    setFieldErrors({})
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    console.log('Form submitted')

    // Validate all fields first
    const errors = validateForm()
    console.log('Validation errors:', errors)

    // Check for empty required fields
    if (Object.keys(errors).length > 0) {
      clearAllErrors()
      console.log('Setting field errors:', errors)
      setFieldErrors(errors)
      return // Stop form submission here
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      clearAllErrors()
      setErrorConfirmPassword('Les mots de passe ne correspondent pas.')
      return
    }

    // Check password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[a-zA-Z0-9\S]{8,}$/

    if (!passwordRegex.test(formData.password)) {
      clearAllErrors()
      setErrorPassword(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
      )
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      clearAllErrors()
      setErrorEmail("Format d'email invalide.")
      return
    }

    // Clear all errors before submitting
    clearAllErrors()

    // Only if all validations pass, proceed with submission
    try {
      // You'll need to implement this method in your UserContext
      await registerManager({
        name: formData.name,
        firstname: formData.firstname,
        email: formData.email,
        password: formData.password,
      })

      // Show success message
      setRegistrationSuccess(true)

      // Redirect after delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      console.error('ManagerRegisterPage::error: ', err)
      setErrorEmail('Cette adresse email est déjà utilisée.')
    }
  }

  return (
    <Box
      className="register-form"
      sx={{ maxWidth: 1000, margin: 'auto', marginTop: 4 }}
    >
      {registrationSuccess ? (
        <Box
          sx={{
            p: 4,
            bgcolor: 'success.light',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '300px',
          }}
        >
          <Typography variant="h4" color="success.dark" gutterBottom>
            Inscription réussie !
          </Typography>
          <Typography variant="body1" paragraph color="text.primary">
            Le compte gestionnaire a été créé avec succès.
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Vous allez être redirigé vers la page de connexion dans quelques
            instants...
          </Typography>
          <CircularProgress sx={{ mt: 4 }} color="success" size={40} />
        </Box>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            padding: '16px',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h4" align="center" color="primary" gutterBottom>
            Inscrire un gestionnaire
          </Typography>
          {Object.keys(fieldErrors).length > 0 && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography color="black" variant="subtitle2" align="center">
                Veuillez remplir tous les champs obligatoires.
              </Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Nom"
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
              label="Prénom"
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
          </Box>

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
            label="Mot de passe"
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
            error={!!errorPassword || Boolean(fieldErrors.password)}
            helperText={errorPassword || fieldErrors.password || ''}
          />
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            variant="outlined"
            value={formData.confirmPassword}
            onChange={handleChange}
            color="primary"
            data-testid="confirm-password-input"
            sx={{
              input: { color: theme.palette.secondary.contrastText },
              mb: 1,
            }}
            error={
              !!errorConfirmPassword || Boolean(fieldErrors.confirmPassword)
            }
            helperText={
              errorConfirmPassword || fieldErrors.confirmPassword || ''
            }
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1, mb: 1 }}
            data-testid="submit-button"
          >
            Inscrire
          </Button>
        </form>
      )}
    </Box>
  )
}

export default ManagerRegisterPage
