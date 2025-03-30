import React from 'react'
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import HomePage from './HomePage'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CartContext } from '../../contexts/CartContext'
import { ProductContext } from '../../contexts/ProductContext'

// Helper pour rendre le composant avec tous les providers nécessaires
const renderWithProviders = (component: React.ReactNode) => {
  const theme = createTheme()

  // Mock du contexte de produits
  const productContextValue = {
    products: [
      {
        id: 1,
        name: 'Produit Test',
        price: '10.00€',
        image: 'https://via.placeholder.com/150',
        category: 'legumes',
        description: 'Description test',
      },
    ],
    getProductById: (id: number) =>
      productContextValue.products.find((p) => p.id === id),
    getProductsByCategory: (category: string) =>
      productContextValue.products.filter((p) => p.category === category),
    getCategoryLabel: (category: string) => {
      const labels: Record<string, string> = {
        legumes: 'Légumes',
        fruits: 'Fruits',
      }
      return labels[category] || category
    },
    isLoading: false,
    error: null,
  }

  // Mock du contexte du panier
  const cartContextValue = {
    cartItems: [],
    addToCart: () => {},
    removeFromCart: () => {},
    clearCart: () => {},
    updateQuantity: () => {},
    getCartCount: () => 0,
  }

  return render(
    <ThemeProvider theme={theme}>
      <ProductContext.Provider value={productContextValue}>
        <CartContext.Provider value={cartContextValue}>
          <MemoryRouter>{component}</MemoryRouter>
        </CartContext.Provider>
      </ProductContext.Provider>
    </ThemeProvider>
  )
}

test('uses correct Material-UI components', () => {
  renderWithProviders(<HomePage />)

  // Vérification de la présence des boutons
  const buttons = screen.getAllByRole('button')
  expect(buttons.length).toBeGreaterThan(0)
})
