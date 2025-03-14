import { useState, SyntheticEvent, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Button, TextField, Typography } from '@mui/material'
import { UserContextType } from '../../types'
import { UserContext } from '../../contexts/UserContext'
import './index.css'

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    firstname: '',
    street: '',
    number: '',
    box: '',
    postalCode: '',
    city: '',
    country: '',
    phoneNumber: '',
    email: '',
    password: '',
  })

  const handleChange = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData, [target.name]: target.value })
  }

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    try {
      await registerUser({
        name: formData.name,
        firstname: formData.firstname,
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
      navigate('/')
    } catch (err) {
      console.error('RegisterPage::error: ', err)
    }
  }

  return (
    <Box className="register-form" sx={{ maxWidth: 1000, margin: 'auto' }}>
      <Typography variant="h4" align="center" color="success" gutterBottom>
        S'inscrire
      </Typography>

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(0, 255, 0, 0.1)', // Light green background with low opacity
          padding: '16px',
          borderRadius: '8px',
        }}
      >
        <TextField
          name="name"
          label="Name"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />
        <TextField
          name="firstname"
          label="First Name"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />
        <TextField
          name="street"
          label="Street"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />
        <TextField
          name="number"
          label="Number"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />

        {/* Boîte & Code postal */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField name="box" label="Box" fullWidth onChange={handleChange} />
          <TextField
            name="postalCode"
            label="Postal Code"
            fullWidth
            onChange={handleChange}
            required
          />
        </Box>

        {/* Commune & Pays */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <TextField
            name="city"
            label="City"
            fullWidth
            onChange={handleChange}
            required
          />
          <TextField
            name="country"
            label="Country"
            fullWidth
            onChange={handleChange}
            required
          />
        </Box>

        <TextField
          name="phoneNumber"
          label="Phone Number"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          onChange={handleChange}
          required
          sx={{ mb: 1 }}
        />

        <Button
          type="submit"
          variant="contained"
          color="success"
          fullWidth
          sx={{ mb: 2 }}
        >
          S'inscrire
        </Button>
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="success"
          fullWidth
        >
          Vous avez un compte ? Connectez vous
        </Button>
      </form>
    </Box>
  )
}

export default RegisterPage
