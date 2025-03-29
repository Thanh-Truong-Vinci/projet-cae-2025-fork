import React from 'react'
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import HomePage from './HomePage'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CartContext } from '../../contexts/CartContext'

// Helper pour rendre le composant avec les providers nécessaires
const renderWithProviders = (component: React.ReactNode) => {
  const theme = createTheme()

  // Mock du contexte du panier avec getCartCount ajouté
  const cartContextValue = {
    cartItems: [],
    addToCart: () => {},
    removeFromCart: () => {},
    clearCart: () => {},
    updateQuantity: () => {},
    getCartCount: () => 0, // Ajout de cette fonction manquante
  }

  return render(
    <ThemeProvider theme={theme}>
      <CartContext.Provider value={cartContextValue}>
        <MemoryRouter>{component}</MemoryRouter>
      </CartContext.Provider>
    </ThemeProvider>
  )
}



  test('uses correct Material-UI components', () => {
    renderWithProviders(<HomePage />)

    // Vérification de la présence des boutons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
})
