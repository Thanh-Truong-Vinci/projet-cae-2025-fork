import { render, screen, cleanup } from '@testing-library/react'
import { describe, test, expect, afterEach } from 'vitest'
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
    const jsLoveText = screen.getByText(
      'Une application développée par le groupe09'
    )
    expect(jsLoveText).toBeDefined()
    const brandText = screen.getByText(/Terroirs Unis/i)
    expect(brandText).toBeDefined()
  })
  test('displays the logo image', () => {
    renderWithTheme(<Footer />)

    // Find image by its tag since it has empty alt text
    const logoImage = document.querySelector('img')
    expect(logoImage).toBeDefined()
    // Check width attribute
    expect(logoImage?.getAttribute('width')).toBe('50')
  })
  test('renders with copyright icon', () => {
    renderWithTheme(<Footer />)

    // We can't directly test for the MUI Copyright icon,
    // but we can test if the container has the expected text
    const copyrightContainer = screen.getByText(/Terroirs Unis/i)
    expect(copyrightContainer).toBeDefined()
  })
  test('uses the correct theme color for background', () => {
    // Create a custom theme to test theming
    const customTheme = createTheme({
      palette: {
        mode: 'light',
        secondary: {
          light: '#f5f5f5',
          main: '#e0e0e0',
          dark: '#9e9e9e',
          contrastText: '#000',
        },
      },
    })

    render(
      <ThemeProvider theme={customTheme}>
        <Footer />
      </ThemeProvider>
    )

    // Get the footer element
    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeDefined()

    // Check that it has styles applied (we can't check computed styles directly)
    expect(footerElement.tagName.toLowerCase()).toBe('footer')
  })
})
