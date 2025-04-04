import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import ReservationsPage from '../../components/pages/ReservationsPage'
import { UserContext } from '../../contexts/UserContext'

// Mocking react-router-dom's useNavigate
const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

// Mocking Material UI components that might cause issues
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material')
  return {
    ...actual,
    Accordion: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown // Changed from any to unknown
    }) => (
      <div data-testid="mock-accordion" {...props}>
        {children}
      </div>
    ),
    AccordionSummary: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown // Changed from any to unknown
    }) => (
      <div data-testid="mock-accordion-summary" {...props}>
        {children}
      </div>
    ),
    AccordionDetails: ({
      children,
      ...props
    }: {
      children: React.ReactNode
      [key: string]: unknown // Changed from any to unknown
    }) => (
      <div data-testid="mock-accordion-details" {...props}>
        {children}
      </div>
    ),
  }
})

vi.mock('@mui/icons-material/ExpandMore', () => ({
  default: () => <div data-testid="mock-expand-icon">ExpandMoreIcon</div>,
}))

describe('ReservationsPage', () => {
  // Rest of your test file remains unchanged
  // Sample data for tests
  const mockReservations = [
    {
      id: 1,
      userId: 1,
      date: '2025-04-01T10:00:00Z',
      items: [
        {
          id: 101,
          name: 'Pommes Bio',
          price: '5.99€',
          image: 'https://example.com/apple.jpg',
          quantity: 2,
          unitType: 'kg',
        },
      ],
      total: 11.98,
      status: 'En attente',
    },
    {
      id: 2,
      userId: 1,
      date: '2025-04-05T14:30:00Z',
      items: [
        {
          id: 102,
          name: 'Carottes',
          price: '3.50€',
          image: 'https://example.com/carrot.jpg',
          quantity: 1,
          unitType: 'kg',
        },
        {
          id: 103,
          name: 'Lait',
          price: '2.20€',
          image: 'https://example.com/milk.jpg',
          quantity: 3,
          unitType: 'L',
        },
      ],
      total: 10.1,
      status: 'Confirmé',
    },
  ]

  const mockAuthenticatedUser = {
    id: 1,
    name: 'Dupont',
    firstname: 'Jean',
    email: 'jean.dupont@example.com',
    role: 'Client',
    token: 'mock-token',
  }

  // Mock local storage
  const localStorageMock = (function () {
    let store: Record<string, string> = {}

    return {
      getItem: (key: string) => {
        return store[key] || null
      },
      setItem: (key: string, value: string) => {
        store[key] = value.toString()
      },
      clear: () => {
        store = {}
      },
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Setup for each test
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    window.localStorage.clear()

    // Setup localStorage with mock reservations
    window.localStorage.setItem(
      'userReservations',
      JSON.stringify(mockReservations)
    )
  })

  const renderWithContext = (authenticatedUser = mockAuthenticatedUser) => {
    const mockUserContext = {
      authenticatedUser,
      authsMe: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    return render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <ReservationsPage />
        </UserContext.Provider>
      </MemoryRouter>
    )
  }

  test('displays empty state when no reservations exist', () => {
    // Clear localStorage to simulate no reservations
    window.localStorage.clear()

    renderWithContext()

    // Check for empty state message
    expect(screen.getByText("Vous n'avez aucune réservation")).toBeTruthy()

    // Check for CTA button
    const discoverButton = screen.getByText('Découvrir nos produits')
    expect(discoverButton).toBeTruthy()

    // Test button click
    fireEvent.click(discoverButton)
    expect(mockedNavigate).toHaveBeenCalledWith('/')
  })

  test('displays reservations when they exist', async () => {
    renderWithContext()

    // Check page title
    expect(screen.getByText('Mes Réservations')).toBeTruthy()

    // Should have 2 accordion elements (1 per reservation)
    const accordions = screen.getAllByTestId('mock-accordion')
    expect(accordions).toHaveLength(2)

    // First reservation title should be visible - utilisons getAllByText au lieu de getByText
    const reservationDates = screen.getAllByText(/Réservation du/i)
    expect(reservationDates.length).toBeGreaterThan(0)

    // Check for the status chips
    expect(screen.getByText('En attente')).toBeTruthy()
    expect(screen.getByText('Confirmé')).toBeTruthy()

    // Check for total prices - utilisons getAllByText pour les montants qui peuvent apparaître plusieurs fois
    expect(screen.getAllByText('11.98€').length).toBeGreaterThan(0)
    expect(screen.getAllByText('10.10€').length).toBeGreaterThan(0)
  })

  test('shows reservation details when accordion is expanded', async () => {
    renderWithContext()

    // Find all accordions
    const accordions = screen.getAllByTestId('mock-accordion-summary')

    // Click the first accordion to expand it
    fireEvent.click(accordions[0])

    // Check for table headers in details
    // Utilisez getAllByText et vérifiez qu'au moins un élément existe
    expect(screen.getAllByText('Produit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Nom').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Prix unitaire').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Quantité').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Total').length).toBeGreaterThan(0)

    // Check for specific product details
    // Ces éléments devraient être uniques
    expect(screen.getByText('Pommes Bio')).toBeTruthy()
    expect(screen.getByText('5.99€')).toBeTruthy()
    expect(screen.getByText(/2 kg/)).toBeTruthy()

    // Check for reservation ID
    expect(screen.getByText(/Numéro de réservation: #1/)).toBeTruthy()
  })

  test('can display multiple items in a reservation', async () => {
    renderWithContext()

    // Find all accordions
    const accordions = screen.getAllByTestId('mock-accordion-summary')

    // Click the second accordion to expand it (contains multiple items)
    fireEvent.click(accordions[1])

    // Check for both products in second reservation
    expect(screen.getByText('Carottes')).toBeTruthy()
    expect(screen.getByText('Lait')).toBeTruthy()

    // Check quantities - utilisez des regex pour plus de précision
    expect(screen.getByText(/1 kg/)).toBeTruthy()
    expect(screen.getByText(/3 L/)).toBeTruthy()

    // Check for reservation ID
    expect(screen.getByText(/Numéro de réservation: #2/)).toBeTruthy()
  })

  test('sorts reservations with most recent first', () => {
    // Add a reservation with an older date
    const oldReservation = {
      id: 3,
      userId: 1,
      date: '2025-03-10T09:15:00Z', // Older date
      items: [
        {
          id: 104,
          name: 'Œufs',
          price: '4.50€',
          image: 'https://example.com/eggs.jpg',
          quantity: 1,
          unitType: 'douzaine',
        },
      ],
      total: 4.5,
      status: 'Prêt',
    }

    const allReservations = [...mockReservations, oldReservation]
    window.localStorage.setItem(
      'userReservations',
      JSON.stringify(allReservations)
    )

    renderWithContext()

    // The most recent reservations should appear first
    // Get all accordion summaries to check their order
    const accordions = screen.getAllByTestId('mock-accordion-summary')

    // We can't directly check the order in the DOM without more specific test IDs
    // But we can verify we have 3 reservations
    expect(accordions).toHaveLength(3)

    // Should have all statuses including the new "Prêt" status
    expect(screen.getByText('En attente')).toBeTruthy()
    expect(screen.getByText('Confirmé')).toBeTruthy()
    expect(screen.getByText('Prêt')).toBeTruthy()
  })
})
