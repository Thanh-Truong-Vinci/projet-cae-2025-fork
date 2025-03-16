import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  test('renders the homepage with correct title and subtitle', () => {
    render(<HomePage />)

    // Vérifier que le titre principal est affiché
    const title = screen.getByText('HomePage')
    // Verify that the main title is displayed
    const title = screen.getByText('My HomePage')
    expect(title).toBeDefined() // Assertion Vitest
    expect(title.tagName).toBe('H1')
  })

  test('uses correct Material-UI components', () => {
    render(<HomePage />)

    // Verify the presence of the main container
    const mainContainer = screen.getByRole('main')
    expect(mainContainer).toBeDefined()
  })
})
