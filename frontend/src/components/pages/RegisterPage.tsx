import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, TextField, Typography } from '@mui/material';
import { UserContextType } from '../../types';
import { UserContext } from '../../contexts/UserContext';
import './index.css';

const RegisterPage = () => {
  const { registerUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    rue: '',
    numero_rue: '',
    boite: '',
    code_postal: '',
    commune: '',
    pays: '',
    tel: '',
    email: '',
    mdp: ''
  });

  const handleChange = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData, [target.name]: target.value });
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      await registerUser({
        username: formData.email, // Mapping email vers username
        password: formData.mdp   // Mapping mdp vers password
      });
      navigate('/');
    } catch (err) {
      console.error('RegisterPage::error: ', err);
    }
  };

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
          <TextField name="nom" label="Nom" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />
          <TextField name="prenom" label="Prénom" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />
          <TextField name="rue" label="Rue" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />
          <TextField name="numero_rue" label="Numéro de rue" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />

          {/* Boîte & Code postal */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField name="boite" label="Boîte" fullWidth onChange={handleChange} />
            <TextField name="code_postal" label="Code postal" fullWidth onChange={handleChange} required />
          </Box>

          {/* Commune & Pays */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField name="commune" label="Commune" fullWidth onChange={handleChange} required />
            <TextField name="pays" label="Pays" fullWidth onChange={handleChange} required />
          </Box>

          <TextField name="tel" label="Téléphone" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />
          <TextField name="email" label="Email" type="email" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />
          <TextField name="mdp" label="Mot de passe" type="password" fullWidth onChange={handleChange} required sx={{ mb: 1 }} />

          <Button type="submit" variant="contained" color="success" fullWidth sx={{ mb: 2 }}>
            S'inscrire
          </Button>
          <Button component={Link} to="/login" variant="contained" color="success" fullWidth>
            Vous avez un compte ? Connectez vous
          </Button>
        </form>
      </Box>
  );
};

export default RegisterPage;