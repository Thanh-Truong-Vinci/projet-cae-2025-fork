import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { BatchProvider } from './BatchProvider'
import { BatchContext } from './BatchContext'
import { UserContext } from './UserContext'
import { UserContextType, PendingBatch } from '../types'
import axios from 'axios'
import React from 'react'

vi.mock('axios')

describe('BatchProvider', () => {
  // Mock the global fetch
  const mockFetch = vi.fn()
  global.fetch = mockFetch as unknown as typeof fetch

  // Mock authenticated user
  const mockAuthenticatedUser = {
    id: 1,
    name: 'Test',
    firstname: 'User',
    email: 'test@example.com',
    role: 'Producer',
    token: 'mock-token',
  }

  // Mock user context
  const mockUserContextValue = {
    authenticatedUser: mockAuthenticatedUser,
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    registerUser: vi.fn(),
    clearUser: vi.fn(),
    authsMe: vi.fn(),
  } as unknown as UserContextType

  // Sample batch data - used indirectly in test expectations and mocks

  // Mock raw batch data (as returned from API)
  const mockRawBatches = [
    {
      id: 1,
      product: {
        name: 'Apple',
        type: { title: 'Fruit' },
      },
      photo: { imageLocation: 'http://example.com/apple.jpg' },
      availabilityDate: '2024-01-01',
      availableQuantity: 100,
      unitPrice: 2.5,
      saleUnit: 'kg',
      producer: {
        id: 1,
        firstname: 'Farmer',
        name: 'One',
      },
      productionDate: '2024-01-01',
      status: 'APPROVED',
    },
    {
      id: 2,
      product: {
        name: 'Carrot',
        type: { title: 'Vegetable' },
      },
      photo: { imageLocation: 'http://example.com/carrot.jpg' },
      availabilityDate: '2024-01-02',
      availableQuantity: 50,
      unitPrice: 1.5,
      saleUnit: 'kg',
      producer: {
        id: 2,
        firstname: 'Farmer',
        name: 'Two',
      },
      productionDate: '2024-01-02',
      status: 'PENDING',
    },
  ]

  // Mock pending batches data
  const mockPendingBatches = [
    {
      batchId: 5,
      productName: 'Tomato',
      productType: 'Vegetable',
      producer: {
        id: 3,
        firstname: 'Jane',
        name: 'Smith',
        email: 'jane@example.com',
      },
      availabilityDate: '2024-01-05',
      availableQuantity: 30,
      unitPrice: 3.2,
      unitType: 'kg',
      description: 'Fresh tomatoes',
      photo: { id: 10, imageLocation: 'http://example.com/tomato.jpg' },
      status: 'PENDING',
    },
  ] as unknown as PendingBatch[]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.mocked(axios.patch).mockResolvedValue({
      data: mockRawBatches[0],
      status: 200,
    })
  })

  const TestConsumer = () => {
    const context = React.useContext(BatchContext)
    if (!context) {
      throw new Error('BatchContext must be used within a BatchProvider')
    }

    return (
      <div>
        <div data-testid="loading">{context.isLoading.toString()}</div>
        <div data-testid="error">{context.error || 'no error'}</div>
        <div data-testid="batch-count">{context.myBatches.length}</div>
        <div data-testid="pending-batch-count">
          {context.pendingBatches.length}
        </div>
        <div data-testid="approved-batch-count">
          {context.approvedBatches.length}
        </div>
        <div data-testid="received-batch-count">
          {context.receivedBatches.length}
        </div>
        <button
          data-testid="fetch-my-batches"
          onClick={() => context.fetchMyBatches()}
        >
          Fetch My Batches
        </button>
        <button
          data-testid="fetch-pending-batches"
          onClick={() => context.fetchPendingBatches()}
        >
          Fetch Pending Batches
        </button>
        <button
          data-testid="fetch-approved-batches"
          onClick={() => context.fetchApprovedBatches()}
        >
          Fetch Approved Batches
        </button>
        <button
          data-testid="fetch-received-batches"
          onClick={() => context.fetchReceivedBatches()}
        >
          Fetch Received Batches
        </button>
      </div>
    )
  }

  const renderWithProviders = () => {
    return render(
      <UserContext.Provider value={mockUserContextValue}>
        <BatchProvider>
          <TestConsumer />
        </BatchProvider>
      </UserContext.Provider>
    )
  }

  test('renders without crashing', () => {
    renderWithProviders()
    expect(screen.getByTestId('loading').textContent).toBe('false')
    expect(screen.getByTestId('error').textContent).toBe('no error')
    expect(screen.getByTestId('batch-count').textContent).toBe('0')
  })

  test('fetches my batches correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawBatches,
    })

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-my-batches').click()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/batches/mybatches',
        expect.any(Object)
      )
      expect(screen.getByTestId('batch-count').textContent).toBe('2')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('handles fetch errors correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-my-batches').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).not.toBe('no error')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('fetches pending batches correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawBatches,
    })

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-pending-batches').click()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/batches/pending',
        expect.any(Object)
      )
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('fetches approved batches correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawBatches,
    })

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-approved-batches').click()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/batches/approved')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('fetches received batches correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawBatches,
    })

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-received-batches').click()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/batches/received')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('handles network error for fetchMyBatches', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'))

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-my-batches').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain('Network Error')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('handles network error for fetchPendingBatches', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'))

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-pending-batches').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain('Network Error')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('handles network error for fetchApprovedBatches', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'))

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-approved-batches').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain('Network Error')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('handles network error for fetchReceivedBatches', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network Error'))

    renderWithProviders()

    await act(async () => {
      screen.getByTestId('fetch-received-batches').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain('Network Error')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  test('fetches approved batches automatically for volunteer users', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawBatches,
    })

    const volunteerUserContext = {
      ...mockUserContextValue,
      authenticatedUser: {
        ...mockAuthenticatedUser,
        role: 'Volunteer',
      },
    } as unknown as UserContextType

    render(
      <UserContext.Provider value={volunteerUserContext}>
        <BatchProvider>
          <div data-testid="dummy">Volunteer Component</div>
        </BatchProvider>
      </UserContext.Provider>
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/batches/approved')
    })
  })

  test('allows managers to fetch pending batches', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPendingBatches,
    })

    const managerUserContext = {
      ...mockUserContextValue,
      authenticatedUser: {
        ...mockAuthenticatedUser,
        role: 'Manager',
      },
    } as unknown as UserContextType

    // Create a specific manager test component
    const ManagerTestComponent = () => {
      const context = React.useContext(BatchContext)
      if (!context)
        throw new Error('BatchContext must be used within a BatchProvider')

      return (
        <div>
          <button
            data-testid="fetch-pending-batches"
            onClick={() => context.fetchPendingBatches()}
          >
            Fetch Pending Batches
          </button>
          <div data-testid="pending-count">{context.pendingBatches.length}</div>
        </div>
      )
    }

    render(
      <UserContext.Provider value={managerUserContext}>
        <BatchProvider>
          <ManagerTestComponent />
        </BatchProvider>
      </UserContext.Provider>
    )

    await act(async () => {
      screen.getByTestId('fetch-pending-batches').click()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/batches/pending',
        expect.any(Object)
      )
      expect(screen.getByTestId('pending-count').textContent).toBe('1')
    })
  })

  test('allows producers to fetch their batches', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRawBatches,
    })

    // Create a specific producer test component
    const ProducerTestComponent = () => {
      const context = React.useContext(BatchContext)
      if (!context)
        throw new Error('BatchContext must be used within a BatchProvider')

      return (
        <div>
          <button
            data-testid="fetch-my-batches"
            onClick={() => context.fetchMyBatches()}
          >
            Fetch My Batches
          </button>
          <div data-testid="my-batches-count">{context.myBatches.length}</div>
        </div>
      )
    }

    render(
      <UserContext.Provider value={mockUserContextValue}>
        <BatchProvider>
          <ProducerTestComponent />
        </BatchProvider>
      </UserContext.Provider>
    )

    await act(async () => {
      screen.getByTestId('fetch-my-batches').click()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/batches/mybatches',
        expect.any(Object)
      )
      expect(screen.getByTestId('my-batches-count').textContent).toBe('2')
    })
  })

  test('does not fetch my batches automatically for producer users', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockRawBatches,
    })

    await act(async () => {
      render(
        <UserContext.Provider value={mockUserContextValue}>
          <BatchProvider>
            <div data-testid="dummy">Producer Component</div>
          </BatchProvider>
        </UserContext.Provider>
      )
    })

    // Wait to ensure any potential effects would have run
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verify that fetch was NOT called (which is the actual behavior)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
