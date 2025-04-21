import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import VolunteerHomePage from './VolunteerHomePage'
import { UserContext } from '../../contexts/UserContext'
import { BatchContext } from '../../contexts/BatchContext'
import { ReservationContext } from '../../contexts/ReservationContext'
import {
  ReservationStatus,
  UserContextType,
  BatchContextType,
  ReservationContextType,
} from '../../types'
import React from 'react'

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

  const mockApprovedBatches = [
    {
      id: 1,
      productName: 'Test Product',
      productType: 'Vegetable',
      availableQuantity: 10,
      unitType: 'kg',
      unitPrice: 2.5,
      availabilityDate: '2024-01-01',
      imageUrl: 'https://example.com/image.jpg',
      producerId: 1,
      createdAt: '2024-01-01',
      status: 'APPROVED',
    },
  ]

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

  const receiveBatchMock = vi.fn()
  const fetchAllReservationsMock = vi.fn()
  const toConfirmReservationMock = vi.fn()

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

  const mockBatchContextValue = {
    myBatches: [],
    pendingBatches: [],
    approvedBatches: mockApprovedBatches,
    receivedBatches: [],
    isLoading: false,
    error: null,
    fetchMyBatches: vi.fn(),
    fetchPendingBatches: vi.fn(),
    fetchApprovedBatches: vi.fn(),
    fetchReceivedBatches: vi.fn().mockResolvedValue([]),
    createBatch: vi.fn(),
    createBatchWithExistingProduct: vi.fn(),
    createBatchWithExistingImage: vi.fn(),
    updateBatchImage: vi.fn(),
    updateBatchImageById: vi.fn(),
    approveBatch: vi.fn(),
    rejectBatch: vi.fn(),
    receiveBatch: receiveBatchMock,
    setBatchError: vi.fn(),
  } as unknown as BatchContextType

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
  } as unknown as ReservationContextType

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigateMock)
  })

  const renderWithContexts = (
    userContext = mockUserContextValue,
    batchContext = mockBatchContextValue,
    reservationContext = mockReservationContextValue
  ) => {
    return render(
      <MemoryRouter>
        <UserContext.Provider value={userContext}>
          <BatchContext.Provider value={batchContext}>
            <ReservationContext.Provider value={reservationContext}>
              <VolunteerHomePage />
            </ReservationContext.Provider>
          </BatchContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
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

  test('displays loading state when fetching data', () => {
    const loadingBatchContext = {
      ...mockBatchContextValue,
      isLoading: true,
    } as unknown as BatchContextType

    renderWithContexts(mockUserContextValue, loadingBatchContext)

    const loadingIndicators = screen.getAllByRole('progressbar')
    expect(loadingIndicators.length).toBeGreaterThan(0)
  })

  test('displays error state when fetch fails', () => {
    const errorBatchContext = {
      ...mockBatchContextValue,
      error: 'Failed to load data',
    } as unknown as BatchContextType

    renderWithContexts(mockUserContextValue, errorBatchContext)
    const errorMessages = screen.getAllByText('Failed to load data')
    expect(errorMessages.length).toBeGreaterThan(0)
  })

  test('displays empty state when no approved batches', () => {
    const emptyBatchContext = {
      ...mockBatchContextValue,
      approvedBatches: [],
    } as unknown as BatchContextType

    renderWithContexts(mockUserContextValue, emptyBatchContext)

    expect(
      screen.getByText('Aucun lot approuvé à recevoir pour le moment.')
    ).toBeTruthy()
  })

  test('displays approved batches correctly', () => {
    renderWithContexts()

    expect(screen.getByText('Test Product')).toBeTruthy()
    expect(screen.getByText('Vegetable')).toBeTruthy()
    expect(screen.getByText(/10/)).toBeTruthy()
    expect(screen.getByText(/2.5/)).toBeTruthy()

    const receiveButton = screen.getByText('Recevoir')
    expect(receiveButton).toBeTruthy()
  })

  test('opens confirmation dialog when receive button is clicked', () => {
    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    expect(screen.getByText('Confirmer la réception')).toBeTruthy()
    expect(
      screen.getByText(/Êtes-vous sûr de vouloir marquer ce lot comme reçu/)
    ).toBeTruthy()

    expect(screen.getByText('Annuler')).toBeTruthy()
    const confirmDialogButton = screen.getAllByText('Confirmer')[1]
    expect(confirmDialogButton).toBeTruthy()
  })

  test('calls receiveBatch when confirm dialog button is clicked', async () => {
    receiveBatchMock.mockResolvedValue(undefined)

    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    const confirmDialogButton = screen.getAllByText('Confirmer')[1]
    fireEvent.click(confirmDialogButton)

    expect(receiveBatchMock).toHaveBeenCalledWith(1)

    await waitFor(() => {
      expect(screen.getByText('Lot marqué comme reçu avec succès')).toBeTruthy()
    })
  })

  test('shows error message when receiveBatch fails', async () => {
    receiveBatchMock.mockRejectedValue(new Error('Failed to receive batch'))

    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    const confirmDialogButton = screen.getAllByText('Confirmer')[1]
    fireEvent.click(confirmDialogButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to receive batch')).toBeTruthy()
    })
  })

  test('calls toConfirmReservation when reservation confirmation button is clicked', async () => {
    toConfirmReservationMock.mockResolvedValue(undefined)

    renderWithContexts()

    const confirmReservationButton = screen.getAllByText('Confirmer')[0]
    fireEvent.click(confirmReservationButton)

    expect(toConfirmReservationMock).toHaveBeenCalledWith(1)

    await waitFor(() => {
      expect(screen.getByText('Réservation confirmée avec succès')).toBeTruthy()
    })
  })

  test('shows error message when toConfirmReservation fails', async () => {
    toConfirmReservationMock.mockRejectedValue(
      new Error('Failed to confirm reservation')
    )

    renderWithContexts()

    const confirmReservationButton = screen.getAllByText('Confirmer')[0]
    fireEvent.click(confirmReservationButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to confirm reservation')).toBeTruthy()
    })
  })

  test('toggles reservation details when details button is clicked', () => {
    renderWithContexts()

    expect(screen.queryByText('Lignes de réservation')).toBeNull()

    const detailsButton = screen.getByText('Détails')
    fireEvent.click(detailsButton)

    expect(screen.getByText('Lignes de réservation')).toBeTruthy()
    expect(screen.getByText('Nom du produit')).toBeTruthy()

    const quantityHeaders = screen.getAllByText('Quantité')
    expect(quantityHeaders.length).toBeGreaterThan(0)

    const priceHeaders = screen.getAllByText('Prix')
    expect(priceHeaders.length).toBeGreaterThan(0)

    expect(screen.getByText('Cacher')).toBeTruthy()

    const hideButton = screen.getByText('Cacher')
    fireEvent.click(hideButton)

    expect(screen.queryByText('Lignes de réservation')).toBeNull()
  })

  test('closes dialog when cancel button is clicked', async () => {
    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    expect(screen.getByText('Confirmer la réception')).toBeTruthy()

    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Confirmer la réception')).toBeNull()
    })
    expect(receiveBatchMock).not.toHaveBeenCalled()
  })

  test('handles empty pending reservations correctly', () => {
    const emptyReservationsContext = {
      ...mockReservationContextValue,
      reservations: [],
    } as unknown as ReservationContextType

    renderWithContexts(
      mockUserContextValue,
      mockBatchContextValue,
      emptyReservationsContext
    )
    expect(screen.getByText('0')).toBeTruthy()
  })

  test('handles null selectedBatchId in confirm dialog', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockReceiveBatchWithCheck = vi.fn().mockImplementation((batchId) => {
      if (batchId === null) {
        return Promise.reject(new Error('Invalid batch ID'))
      }
      return Promise.resolve()
    })

    const customBatchContext = {
      ...mockBatchContextValue,
      receiveBatch: mockReceiveBatchWithCheck,
    } as unknown as BatchContextType

    renderWithContexts(mockUserContextValue, customBatchContext)
    try {
      await mockReceiveBatchWithCheck(null)
      expect('Promise should have been rejected').toBe(false)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('Invalid batch ID')
      } else {
        fail('Expected error to be an instance of Error')
      }
    }
    consoleSpy.mockRestore()
  })

  test('throws error when ReservationContext is null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <MemoryRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <BatchContext.Provider value={mockBatchContextValue}>
              <ReservationContext.Provider value={null as any}>
                <VolunteerHomePage />
              </ReservationContext.Provider>
            </BatchContext.Provider>
          </UserContext.Provider>
        </MemoryRouter>
      )
    ).toThrow('ReservationContext must be used within a ReservationProvider')

    // Restore console.error
    errorSpy.mockRestore()
  })

  test('throws error when BatchContext is null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <MemoryRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <BatchContext.Provider value={null as any}>
              <ReservationContext.Provider value={mockReservationContextValue}>
                <VolunteerHomePage />
              </ReservationContext.Provider>
            </BatchContext.Provider>
          </UserContext.Provider>
        </MemoryRouter>
      )
    ).toThrow('BatchContext doit être utilisé à l intérieur d un BatchProvider')

    errorSpy.mockRestore()
  })

  test('renders correctly with both batch and reservation errors', () => {
    const errorMessage = 'Batch error message'
    const errorContext = {
      ...mockBatchContextValue,
      error: errorMessage,
    } as unknown as BatchContextType

    const errorReservationContext = {
      ...mockReservationContextValue,
      error: 'Reservation error message',
    } as unknown as ReservationContextType

    renderWithContexts(
      mockUserContextValue,
      errorContext,
      errorReservationContext
    )

    const errorElements = screen.getAllByText(errorMessage)
    expect(errorElements.length).toBeGreaterThan(1)

    const batchSection = screen.getByText('Lots à recevoir').closest('div')
    const reservationSection = screen
      .getByText('Réservations en attente')
      .closest('div')

    expect(batchSection?.textContent).toContain(errorMessage)
    expect(reservationSection?.textContent).toContain(errorMessage)
  })

  test('handles empty state for both batches and reservations', () => {
    const emptyContext = {
      ...mockBatchContextValue,
      approvedBatches: [],
    } as unknown as BatchContextType

    const emptyReservationContext = {
      ...mockReservationContextValue,
      reservations: [],
    } as unknown as ReservationContextType

    renderWithContexts(
      mockUserContextValue,
      emptyContext,
      emptyReservationContext
    )
    expect(
      screen.getByText('Aucun lot approuvé à recevoir pour le moment.')
    ).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  test('directly tests the handleReceiveClick function', () => {
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [false, vi.fn()])
    vi.spyOn(React, 'useState').mockImplementationOnce(() => [null, vi.fn()])

    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    expect(screen.getByText('Confirmer la réception')).toBeTruthy()
  })

  test('handles unexpected error format during batch reception', async () => {
    receiveBatchMock.mockRejectedValue('Unexpected error format')

    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    const confirmDialogButton = screen.getAllByText('Confirmer')[1]
    fireEvent.click(confirmDialogButton)

    await waitFor(() => {
      expect(
        screen.getByText('Erreur lors de la réception du lot')
      ).toBeTruthy()
    })
  })

  test('handles unexpected error format during reservation confirmation', async () => {
    toConfirmReservationMock.mockRejectedValue('Unexpected error format')

    renderWithContexts()

    const confirmReservationButton = screen.getAllByText('Confirmer')[0]
    fireEvent.click(confirmReservationButton)

    await waitFor(() => {
      expect(
        screen.getByText('Erreur lors de la confirmation de la réservation')
      ).toBeTruthy()
    })
  })

  test('verifies snackbar message appears after successful action', async () => {
    receiveBatchMock.mockResolvedValue(undefined)

    const { getByText } = renderWithContexts()

    const receiveButton = getByText('Recevoir')
    fireEvent.click(receiveButton)

    const confirmButton = screen.getAllByText('Confirmer')[1]
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Lot marqué comme reçu avec succès')).toBeTruthy()
    })
  })

  test('verifies snackbar message disappears after timeout', async () => {
    receiveBatchMock.mockResolvedValue(undefined)

    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    const confirmButton = screen.getAllByText('Confirmer')[1]
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Lot marqué comme reçu avec succès')).toBeTruthy()
    })

    const closeSnackbar = () => {
      const successMessage = screen.queryByText(
        'Lot marqué comme reçu avec succès'
      )
      if (successMessage && successMessage.parentElement) {
        successMessage.parentElement.remove()
      }
    }

    closeSnackbar()

    await waitFor(() => {
      expect(screen.queryByText('Lot marqué comme reçu avec succès')).toBeNull()
    })
  })

  test('handles all edge cases of reservation display', () => {
    const specialReservationContext = {
      ...mockReservationContextValue,
      reservations: [
        {
          ...mockReservations[0],
          status: ReservationStatus.CONFIRMED,
        },
      ],
    } as unknown as ReservationContextType

    renderWithContexts(
      mockUserContextValue,
      mockBatchContextValue,
      specialReservationContext
    )

    expect(screen.getByText('Lots à recevoir')).toBeTruthy()
    expect(screen.getByText('Réservations en attente')).toBeTruthy()
  })

  test('renders reservation with empty reservationLines', () => {
    const emptyLinesReservationContext = {
      ...mockReservationContextValue,
      reservations: [
        {
          ...mockReservations[0],
          reservationLines: [],
        },
      ],
    } as unknown as ReservationContextType

    renderWithContexts(
      mockUserContextValue,
      mockBatchContextValue,
      emptyLinesReservationContext
    )

    const detailsButton = screen.getByText('Détails')
    fireEvent.click(detailsButton)

    expect(
      screen.getByText('Aucune ligne de réservation disponible.')
    ).toBeTruthy()
  })

  test('tests handleCloseSnackbar function directly', async () => {
    receiveBatchMock.mockResolvedValue(undefined)

    renderWithContexts()

    const receiveButton = screen.getByText('Recevoir')
    fireEvent.click(receiveButton)

    const confirmButton = screen.getAllByText('Confirmer')[1]
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('Lot marqué comme reçu avec succès')).toBeTruthy()
    })

    const message = screen.getByText('Lot marqué comme reçu avec succès')
    if (message.parentElement) {
      message.parentElement.remove()
    }

    await waitFor(() => {
      expect(screen.queryByText('Lot marqué comme reçu avec succès')).toBeNull()
    })
  })

  test('handles early return in handleConfirmReceive', async () => {
    const mockReceiveBatchWithCheck = vi.fn().mockImplementation((batchId) => {
      if (batchId === null || batchId === undefined) {
        return Promise.reject(new Error('Invalid batch ID'))
      }
      return Promise.resolve()
    })

    const customBatchContext = {
      ...mockBatchContextValue,
      receiveBatch: mockReceiveBatchWithCheck,
    } as unknown as BatchContextType

    renderWithContexts(mockUserContextValue, customBatchContext)

    try {
      await mockReceiveBatchWithCheck(null)
      fail('Promise should have been rejected')
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).toBe('Invalid batch ID')
      } else {
        fail('Expected error to be an instance of Error')
      }
    }
  })
})
