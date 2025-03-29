import { useContext, useState, FormEvent } from 'react'
import { UserContext } from '../../contexts/UserContext'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
} from '@mui/material'
import { Navigate } from 'react-router-dom'

const ProfilePage = () => {
  const { authenticatedUser, changePassword } = useContext(UserContext)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect to login if not authenticated
  if (!authenticatedUser) {
    return <Navigate to="/login" />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Basic validation
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError('Erreur lors du changement de mot de passe')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Mon profil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Informations personnelles
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Nom:</strong> {authenticatedUser.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Prénom:</strong> {authenticatedUser.firstname}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {authenticatedUser.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Rôle:</strong> {authenticatedUser.role}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date d'inscription:</strong>{' '}
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Changer le mot de passe
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Mot de passe modifié avec succès!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="currentPassword"
                label="Mot de passe actuel"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmer le nouveau mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: 'green',
                  '&:hover': { backgroundColor: 'darkgreen' },
                }}
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Changer le mot de passe'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProfilePage
