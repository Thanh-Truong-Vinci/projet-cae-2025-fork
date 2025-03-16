import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import HomePage from './HomePage'
// Supprimer l'import de jest-dom qui n'est pas nécessaire avec Vitest

describe('HomePage', () => {
  test('renders the homepage with correct title and subtitle', () => {
    render(<HomePage />)

    // Vérifier que le titre principal est affiché
    const title = screen.getByText('My HomePage')
    expect(title).toBeDefined() // Assertion Vitest
    expect(title.tagName).toBe('H1')

    // Vérifier que le sous-titre est affiché
    const subtitle = screen.getByText(/Because we love JS/i)
    expect(subtitle).toBeDefined() // Assertion Vitest
    expect(subtitle.tagName).toBe('H2')
  })

  test('uses correct Material-UI components', () => {
    render(<HomePage />)

    // Vérifier la présence du conteneur principal
    const mainContainer = screen.getByRole('main')
    expect(mainContainer).toBeDefined()
  })
})
