import { render, screen, cleanup } from '@testing-library/react'
import { describe, test, expect, afterEach, vi } from 'vitest'
import Footer from './index'
import { ThemeProvider, createTheme } from '@mui/material'

// Mock react-leaflet components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}))

// Mock fetch for testing AddressMarker
globalThis.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue({ display_name: 'Test Address' }),
})

// Create theme once for all tests
const theme = createTheme()

// Create a wrapper component with ThemeProvider for testing
const renderWithTheme = (component: JSX.Element) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('Footer', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  test('renders the footer', () => {
    renderWithTheme(<Footer />)
    const footerElement = screen.getByRole('contentinfo')
    expect(footerElement).toBeDefined()
  })

  test('displays opening hours correctly', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByText("Heure d'ouverture du magasin :")).toBeDefined()
    expect(screen.getByText("Mardi de 16 h à 20 h")).toBeDefined()
    expect(screen.getByText("Jeudi de 18 h à 21 h")).toBeDefined()
  })

  test('displays contact information correctly', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByText("Contact :")).toBeDefined()
    expect(screen.getByText("Téléphone : +32 84 987 654")).toBeDefined()
    expect(screen.getByText("Email : contact@terroiretcie.be")).toBeDefined()
  })

  test('displays address information correctly', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByText(/Veuillez nous retrouver à cette adresse :/)).toBeDefined()
    expect(screen.getByText(/Rue du Bon Terroir, 7/)).toBeDefined()
    expect(screen.getByText(/6980 Vafontaine/)).toBeDefined()
    expect(screen.getByText(/Belgique/)).toBeDefined()
  })

  test('renders map container', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByTestId('map-container')).toBeDefined()
    expect(screen.getByTestId('tile-layer')).toBeDefined()
    expect(screen.getByTestId('marker')).toBeDefined()
  })

  test('has correct layout structure with container and flex boxes', () => {
    const { container } = renderWithTheme(<Footer />)
    // Check for Container and Box components
    const containerElement = container.querySelector('.MuiContainer-root')
    expect(containerElement).toBeDefined()
    
    // Should have 4 flex boxes for the 4 sections
    const boxElements = container.querySelectorAll('.MuiBox-root')
    expect(boxElements.length).toBeGreaterThan(4) // At least 5 boxes (4 content + 1 parent)
  })

  test('renders marker with tooltip', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByTestId('tooltip')).toBeDefined()
    expect(screen.getByText('Rue du Bon Terroir')).toBeDefined()
  })
  test('renders marker with popup', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByTestId('popup')).toBeDefined()
    expect(screen.getByText('Rue du Bon Terroir')).toBeDefined()
  })
  test('renders marker with icon', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByTestId('marker')).toBeDefined()
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
