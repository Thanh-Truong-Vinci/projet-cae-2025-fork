import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import Footer from './index'
import { ThemeProvider, createTheme } from '@mui/material'

// Create a wrapper component with ThemeProvider for testing
const renderWithTheme = (component: JSX.Element) => {
  const theme = createTheme()
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('Footer', () => {
  test('renders the footer', () => {
    renderWithTheme(<Footer />)

    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeDefined()
  })
})
