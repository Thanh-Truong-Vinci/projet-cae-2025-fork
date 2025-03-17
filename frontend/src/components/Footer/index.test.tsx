import { render, screen, cleanup } from '@testing-library/react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import Footer from './index'
import { ThemeProvider, createTheme } from '@mui/material'

// Create theme once for all tests
const theme = createTheme()

// Create a wrapper component with ThemeProvider for testing
const renderWithTheme = (component: JSX.Element) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('Footer', () => {
  afterEach(() => {
    cleanup()
  })

  test('renders the footer', () => {
    renderWithTheme(<Footer />)
    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeDefined()
  })

  test('displays the correct text content', () => {
    renderWithTheme(<Footer />)
    const jsLoveText = screen.getByText('But we also love JS')
    expect(jsLoveText).toBeDefined()
    const brandText = screen.getByText(/myAmazingPizzeria/i)
    expect(brandText).toBeDefined()
  })
})
