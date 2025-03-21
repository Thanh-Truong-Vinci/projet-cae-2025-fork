import { Box, Container, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

const AddressMarker = ({ position }: { position: [number, number] }) => {
  const [address, setAddress] = useState('Chargement...');

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        setAddress(data.display_name || 'Adresse non trouvée');
      } catch (error) {
        setAddress('Impossible de charger l\'adresse');
      }
    };
    fetchAddress();
  }, [position]);

  return (
    <Marker position={position}>
      <Popup>{address}</Popup>
      {/* Ajout d'un Tooltip qui est toujours visible */}
      <Tooltip permanent direction="right" offset={[10, 0]}>
        Rue du Bon Terroir
      </Tooltip>
    </Marker>
  );
};

const Footer = () => {
  
  const position: [number, number] = [50.0, 5.0];

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        backgroundColor: 'white',
        color: 'black',
        width: '100%',
      }}
    >
      <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4, height: 150 }}>
        {/* Heures d'ouverture */}
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <Typography variant="h6" gutterBottom>
            Heure d'ouverture du magasin :
          </Typography>
          <Typography>Mardi de 16 h à 20 h</Typography>
          <Typography>Jeudi de 18 h à 21 h</Typography>
        </Box>
        
        {/* Contact */}
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <Typography variant="h6" gutterBottom>
            Contact :
          </Typography>
          <Typography>Téléphone : +32 84 987 654</Typography>
          <Typography>Email : contact@terroiretcie.be</Typography>
        </Box>
        
        {/* Adresse */}
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <Typography>
            Veuillez nous retrouver à cette adresse :<br />
            Rue du Bon Terroir, 7<br />
            6980 Vafontaine<br />
            Belgique
          </Typography>
        </Box>
        
        {/* Carte interactive */}
        <Box sx={{ flex: 1, height: 150 }}>
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AddressMarker position={position} />
          </MapContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;