import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VolunteerHomePage from './VolunteerHomePage'
import { UserContext } from '../../contexts/UserContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import { UserContextType, ReservationContextType } from '../../types'
import { ReservationStatus } from '../../types'

import { MemoryRouter, useNavigate } from 'react-router-dom'

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

describe('VolunteerHomePage', () => {
  const navigateMock = vi.fn()
  const fetchMock = vi.fn()

  // Mock fetch globally
  global.fetch = fetchMock

  beforeEach(() => {
    // Reset and set up fetch mock with default successful response
    fetchMock.mockReset()
    fetchMock.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            productId: 1,
            productName: 'Test Product',
            totalQuantity: 10,
            unitPrice: 2.5,
            saleUnit: 'kg',
            imageLocation: 'https://example.com/image.jpg',
            batchIds: [1, 2],
            batchQuantities: [5, 5],
          },
        ]),
    })
  })

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
        },
      ],
    },
  ]

  const fetchAllReservationsMock = vi.fn()
  const toConfirmReservationMock = vi.fn()
  const reserveDirectMock = vi.fn()
  const cancelReservationMock = vi.fn()

  const mockUserContextValue = {
    authenticatedUser: {
      id: 1,
      name: 'Test',
      firstname: 'User',
      email: 'test@example.com',
      role: 'Volunteer',
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
    fetchReservations: vi.fn(),
    fetchAllReservations: fetchAllReservationsMock,
    createReservation: vi.fn(),
    updateReservation: vi.fn(),
    deleteReservation: vi.fn(),
    toConfirmReservation: toConfirmReservationMock,
    toReadyReservation: vi.fn(),
    toCompletedReservation: vi.fn(),
    toCancelledReservation: vi.fn(),
    cancelReservation: cancelReservationMock,
    abandonReservation: vi.fn(),
    clearReservation: vi.fn(),
    changeReservationLineQuantity: vi.fn(),
    reserveDirect: reserveDirectMock,
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
      <UserContext.Provider value={userContext}>
        <ReservationContext.Provider value={reservationContext}>
          <VolunteerHomePage />
        </ReservationContext.Provider>
      </UserContext.Provider>
    )
  }

  test('redirects to home when not authenticated', () => {
    const unauthenticatedContext = {
      ...mockUserContextValue,
      authenticatedUser: null,
    } as unknown as UserContextType

    renderWithContexts(unauthenticatedContext)

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('redirects to home when authenticated but not as volunteer', () => {
    const nonVolunteerContext = {
      ...mockUserContextValue,
      authenticatedUser: {
        ...mockUserContextValue.authenticatedUser,
        role: 'Client',
      },
    } as unknown as UserContextType

    renderWithContexts(nonVolunteerContext)

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('handles empty pending reservations correctly', () => {
    const emptyReservationsContext = {
      ...mockReservationContextValue,
      reservations: [],
    } as unknown as ReservationContextType

    renderWithContexts(mockUserContextValue, emptyReservationsContext)
    expect(
      screen.getByText('Aucune réservation en attente pour le moment.')
    ).toBeTruthy()
  })

  test('throws error when ReservationContext is null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <MemoryRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <ReservationContext.Provider
              value={null as unknown as ReservationContextType}
            >
              <VolunteerHomePage />
            </ReservationContext.Provider>
          </UserContext.Provider>
        </MemoryRouter>
      )
    ).toThrow('ReservationContext must be used within a ReservationProvider')

    // Restore console.error
    errorSpy.mockRestore()
  })

  test('opens Vente Libre dialog when button is clicked', async () => {
    renderWithContexts()

    const venteLibreButton = screen.getByText('Vente libre')
    fireEvent.click(venteLibreButton)

    await waitFor(() => {
      expect(screen.getByText('Vente Libre')).toBeTruthy()
    })

    // Check dialog content
    expect(
      screen.getByText(/Sélectionnez un produit et une quantité/)
    ).toBeTruthy()
  })

  test('handles cancel reservation correctly', async () => {
    cancelReservationMock.mockResolvedValue(undefined)

    renderWithContexts()

    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)

    expect(cancelReservationMock).toHaveBeenCalledWith(1)

    await waitFor(() => {
      expect(screen.getByText('Réservation annulée avec succès')).toBeTruthy()
    })
  })

  test('handles cancel reservation error', async () => {
    cancelReservationMock.mockRejectedValue(
      new Error('Failed to cancel reservation')
    )

    renderWithContexts()

    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to cancel reservation')).toBeTruthy()
    })
  })
})
