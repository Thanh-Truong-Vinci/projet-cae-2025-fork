import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ReservationsPage from './ReservationsPage'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import { ReservationStatus, UserContextType, ReservationContextType } from '../../types'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn().mockReturnValue('01 janvier 2024'),
  }
})

describe('ReservationsPage', () => {
  const navigateMock = vi.fn()

  const mockReservations = [
    {
      id: 1,
      clientId: 123,
      reservationDate: '2024-01-01T12:00:00',
      price: 25.0,
      status: ReservationStatus.PENDING,
      reservationLines: [
        {
          id: 1,
          quantity: 2,
          batchId: 1,
          productId: 1,
          productName: 'Test Product',
          unitPrice: 12.5,
          imageLocation: 'https://example.com/image.jpg',
        }
      ]
    },
    {
      id: 2,
      clientId: 123,
      reservationDate: '2024-01-02T12:00:00',
      saleDate: '2024-01-03T12:00:00',
      price: 30.0,
      status: ReservationStatus.CONFIRMED,
      reservationLines: [
        {
          id: 2,
          quantity: 3,
          batchId: 2,
          productId: 2,
          productName: 'Another Product',
          unitPrice: 10.0,
          imageLocation: 'https://example.com/another-image.jpg',
        }
      ]
    },
    {
      id: 3,
      clientId: 123,
      reservationDate: '2024-01-04T12:00:00',
      price: 15.0,
      status: ReservationStatus.CANCELLED,
      reservationLines: [
        {
          id: 3,
          quantity: 1,
          batchId: 3,
          productId: 3,
          productName: 'Cancelled Product',
          unitPrice: 15.0,
          imageLocation: null,
        }
      ]
    }
  ]
  
  const fetchReservationsMock = vi.fn()

  const mockUserContextValue = {
    authenticatedUser: {
      id: 1,
      name: 'Test',
      firstname: 'User',
      email: 'test@example.com',
      role: 'Client',
      token: 'mock-token',
    },
    authsMe: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    registerManager: vi.fn(),
    registerProducer: vi.fn(),
    changePassword: vi.fn(),
  } as unknown as UserContextType
  
  const mockReservationContextValue = {
    reservations: mockReservations,
    isLoading: false,
    error: null,
    fetchReservations: fetchReservationsMock,
    fetchAllReservations: vi.fn(),
    createReservation: vi.fn(),
    updateReservation: vi.fn(),
    deleteReservation: vi.fn(),
    toConfirmReservation: vi.fn(),
    toReadyReservation: vi.fn(),
    toCompletedReservation: vi.fn(),
    toCancelledReservation: vi.fn(),
    updateReservationLineQuantity: vi.fn(),
    clearReservation: vi.fn(),
    removeReservationLine: vi.fn(),
  } as unknown as ReservationContextType
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigateMock)
  })

  const renderWithContexts = (
    userContext = mockUserContextValue,
    reservationContext = mockReservationContextValue
  ) => {
    return render(
      <MemoryRouter>
        <UserContext.Provider value={userContext}>
          <ReservationContext.Provider value={reservationContext}>
            <ReservationsPage />
          </ReservationContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    )
  }
  
  test('redirects to login when not authenticated', () => {
    const unauthenticatedContext = {
      ...mockUserContextValue,
      authenticatedUser: null,
    } as unknown as UserContextType

    vi.useFakeTimers()
    
    renderWithContexts(unauthenticatedContext)

    expect(screen.getByText('Vous devez vous connecter pour accéder à vos réservations')).toBeTruthy()

    vi.runAllTimers()

    expect(navigateMock).toHaveBeenCalledWith('/login', { state: { returnTo: '/reservations' } })
    
    vi.useRealTimers()
  })
  
  test('displays loading state when fetching data', () => {
    const loadingReservationContext = {
      ...mockReservationContextValue,
      isLoading: true,
    } as unknown as ReservationContextType
    
    renderWithContexts(mockUserContextValue, loadingReservationContext)

    expect(screen.getByRole('progressbar')).toBeTruthy()
  })
  
  test('displays error state when fetch fails', () => {
    const errorReservationContext = {
      ...mockReservationContextValue,
      error: 'Failed to load reservations',
    } as unknown as ReservationContextType
    
    renderWithContexts(mockUserContextValue, errorReservationContext)

    expect(screen.getByText('Failed to load reservations')).toBeTruthy()
  })
  
  test('displays empty state when no reservations', () => {
    const emptyReservationContext = {
      ...mockReservationContextValue,
      reservations: [],
    } as unknown as ReservationContextType
    
    renderWithContexts(mockUserContextValue, emptyReservationContext)

    expect(screen.getByText('Vous n\'avez aucune réservation')).toBeTruthy()
    expect(screen.getByText('Découvrir nos produits')).toBeTruthy()
  })
  
  test('renders tabs for different reservation statuses', () => {
    renderWithContexts()

    expect(screen.getByRole('tab', { name: 'En attente' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Récupérées' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Abandonnées' })).toBeTruthy()
  })
  
  test('switches between tabs when clicked', () => {
    renderWithContexts()

    expect(screen.getByRole('button', { name: /réservation #1/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Récupérées' }))

    expect(screen.getByRole('button', { name: /réservation #2/i })).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: 'Abandonnées' }))

    expect(screen.getByRole('button', { name: /réservation #3/i })).toBeTruthy()
  })
  
  test('displays reservation details with correct status labels', () => {
    renderWithContexts()
    const statusChips = screen.getAllByText('En attente')
    expect(statusChips.length).toBeGreaterThan(0)
    fireEvent.click(screen.getAllByText('Récupérées')[0])
    expect(screen.getByText('Confirmé')).toBeTruthy()
    fireEvent.click(screen.getAllByText('Abandonnées')[0])
    expect(screen.getByText('Annulé')).toBeTruthy()
  })
  
  test('displays reservation line items when expanded', () => {
    renderWithContexts()

    expect(screen.getByText('Prix unitaire')).toBeTruthy()
    const summaryButton = screen.getByRole('button', { name: /réservation #1/i })
    fireEvent.click(summaryButton)

    expect(screen.getByText('Prix unitaire')).toBeTruthy()
    expect(screen.getByText('Quantité')).toBeTruthy()
    expect(screen.getByText('Total')).toBeTruthy()

    expect(screen.getByText('Test Product')).toBeTruthy()
    expect(screen.getByText(/12\.50/)).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
  })
  
  test('navigates to home page when clicking discover products button', () => {
    const emptyReservationContext = {
      ...mockReservationContextValue,
      reservations: [],
    } as unknown as ReservationContextType
    
    renderWithContexts(mockUserContextValue, emptyReservationContext)

    fireEvent.click(screen.getByText('Découvrir nos produits'))

    expect(navigateMock).toHaveBeenCalledWith('/')
  })
  
  test('fetches reservations on component mount', () => {
    renderWithContexts()
    expect(fetchReservationsMock).toHaveBeenCalledTimes(1)
  })
  
  test('throws error when ReservationContext is null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => 
      render(
        <MemoryRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <ReservationContext.Provider value={null as any}>
              <ReservationsPage />
            </ReservationContext.Provider>
          </UserContext.Provider>
        </MemoryRouter>
      )
    ).toThrow('ReservationContext must be used within a ReservationProvider')

    errorSpy.mockRestore()
  })
  
  test('displays correct date format for reservations', () => {
    renderWithContexts()

    expect(screen.getByText(/Prévu le 01 janvier 2024/)).toBeTruthy()

    fireEvent.click(screen.getByText('Récupérées'))
    expect(screen.getByText(/Retiré le 01 janvier 2024/)).toBeTruthy()
  })
  
  test('handles close of snackbar', async () => {
    const unauthenticatedContext = {
      ...mockUserContextValue,
      authenticatedUser: null,
    } as unknown as UserContextType
    
    renderWithContexts(unauthenticatedContext)
    
    expect(screen.getByText('Vous devez vous connecter pour accéder à vos réservations')).toBeTruthy()

    const closeButton = document.querySelector('.MuiAlert-action button') ||
                        screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Vous devez vous connecter pour accéder à vos réservations')).toBeNull()
    })
  })
  
  test('calculates correct prices for reservation and line items', () => {
    renderWithContexts()

    const summaryButton = screen.getByRole('button', { name: /réservation #1/i })
    fireEvent.click(summaryButton)

    const priceElements = screen.getAllByText(/25\.00€/)
    expect(priceElements.length).toBeGreaterThan(0)

    const unitPriceElements = screen.getAllByText((_content, element) => {
      return element?.textContent?.includes('12.50') || false
    })
    expect(unitPriceElements.length).toBeGreaterThan(0)

    expect(screen.getByText('2')).toBeTruthy()
  })
  
  test('shows placeholder image when imageLocation is null', () => {
    renderWithContexts()
    
    fireEvent.click(screen.getAllByText('Abandonnées')[0])

    const summaryButton = screen.getByRole('button', { name: /réservation #3/i })
    fireEvent.click(summaryButton)

    const images = screen.getAllByRole('img')
    const cancelledProductImage = images.find(img => img.getAttribute('alt') === 'Cancelled Product')
    
    expect(cancelledProductImage).toBeTruthy()
    expect(cancelledProductImage?.getAttribute('src')).toBe('/placeholder.jpg')
  })
})