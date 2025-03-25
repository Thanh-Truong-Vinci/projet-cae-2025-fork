import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
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

describe('HomePage', () => {
  test('renders the homepage with correct title', () => {
    renderWithProviders(<HomePage />)

    // Vérification du titre qui est unique sur la page
    const titleElements = screen.getAllByText(/Produits les plus vendus/i)
    expect(titleElements.length).toBeGreaterThan(0)
  })

  test('renders product carousel section', () => {
    renderWithProviders(<HomePage />)

    // Vérifier la présence du texte "Prix:" qui est dans le carousel
    const priceLabels = screen.getAllByText(/Prix:/i)
    expect(priceLabels.length).toBeGreaterThan(0)

    // Vérifier la présence du bouton "Ajouter au panier"
    const addToCartButton = screen.getAllByText(/Ajouter au panier/i)
    expect(addToCartButton.length).toBeGreaterThan(0)
  })

  test('uses correct Material-UI components', () => {
    renderWithProviders(<HomePage />)

    // Vérification de la présence des boutons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('renders the filter sidebar', () => {
    renderWithProviders(<HomePage />)

    // Vérifier la présence du titre "Filtrer" - utiliser getAllByText au lieu de getByText
    const filterElements = screen.getAllByText(/Filtrer/i)
    expect(filterElements.length).toBeGreaterThan(0)

    // Vérifier la présence du bouton "CONFIRMER"
    const confirmButton = screen.getAllByText(/CONFIRMER/i)
    expect(confirmButton.length).toBeGreaterThan(0)
  })

  test('renders product cards', () => {
    renderWithProviders(<HomePage />)

    // Vérifie qu'au moins un élément avec le texte "Produit" est présent
    // en utilisant getAllByText qui accepte plusieurs correspondances
    const productElements = screen.getAllByText(/Produit \d+/i)
    expect(productElements.length).toBeGreaterThan(0)
  })

  test('renders the "Voir plus" button when there are more products', () => {
    renderWithProviders(<HomePage />)

    // Vérifier la présence du bouton "Voir plus"
    const voirPlusButton = screen.getAllByText(/Voir plus/i)
    expect(voirPlusButton.length).toBeGreaterThan(0)
  })
})
