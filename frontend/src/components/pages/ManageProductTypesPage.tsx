import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Container,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { UserContext } from '../../contexts/UserContext'
import { useProductType } from '../../contexts/ProductTypeContext'

const ManageProductTypesPage = () => {
  const navigate = useNavigate()
  const { authenticatedUser } = useContext(UserContext)
  const { productTypes, loading, error, addProductType, deleteProductType } =
    useProductType()

  const [newType, setNewType] = useState<string>('')
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!authenticatedUser) {
      navigate('/')
    } else if (authenticatedUser.role !== 'Manager') {
      navigate('/')
    }
  }, [authenticatedUser, navigate])

  const handleAddType = async () => {
    const success = await addProductType(newType)
    if (success) {
      setNewType('')
      setOpenAddDialog(false)
      setSuccessMessage('Type ajouté avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleDeleteType = async () => {
    if (selectedTypeId === null) return

    const success = await deleteProductType(selectedTypeId)
    if (success) {
      setOpenDeleteDialog(false)
      setSuccessMessage('Type supprimé avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  if (!authenticatedUser || authenticatedUser.role !== 'Manager') {
    return null
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Gestion des Types de Produits
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            Types de Produits
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Ajouter un Type
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : productTypes.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            Aucun type de produit disponible.
          </Typography>
        ) : (
          <List>
            {productTypes.map((type, index) => (
              <React.Fragment key={type.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => {
                        setSelectedTypeId(type.id)
                        setOpenDeleteDialog(true)
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={type.title} />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Ajouter un nouveau type de produit</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Entrez le nom du nouveau type de produit.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du type"
            fullWidth
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
          <Button onClick={handleAddType} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce type de produit ? Cette action
            est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteType} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default ManageProductTypesPage
