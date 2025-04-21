import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ReceivedProductsPage from './ReceivedProductsPage'
import { UserContext } from '../../contexts/UserContext'
import { ProductContext } from '../../contexts/ProductContext'
import { BatchContext } from '../../contexts/BatchContext'
import {
  UserContextType,
  ProductContextType,
  BatchContextType,
  Batch,
  ProductBatch,
} from '../../types'

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
    format: vi.fn().mockReturnValue('01 Jan 2024'),
  }
})

describe('ReceivedProductsPage', () => {
  const navigateMock = vi.fn()

  const mockProducts: ProductBatch[] = [
    {
      productId: 1,
      productName: 'Pommes',
      productType: 'Fruit',
      description: 'Pommes bio rouges',
      unitPrice: 2.5,
      saleUnit: 'kg',
      totalQuantity: 100,
      companyName: 'Ferme Bio',
      imageLocation: 'http://example.com/pommes.jpg',
      earliestProductionDate: '2024-01-01',
      batchIds: [1, 2],
      batchQuantities: [50, 50],
    },
    {
      productId: 2,
      productName: 'Carottes',
      productType: 'Légume',
      description: 'Carottes fraîches',
      unitPrice: 1.8,
      saleUnit: 'kg',
      totalQuantity: 80,
      companyName: 'Ferme Verte',
      imageLocation: 'http://example.com/carottes.jpg',
      earliestProductionDate: '2024-01-02',
      batchIds: [3],
      batchQuantities: [80],
    },
  ]

  const mockReceivedBatches: Batch[] = [
    {
      id: 1,
      productName: 'Pommes',
      productType: 'Fruit',
      producerName: 'Ferme Bio',
      availabilityDate: '2024-01-01',
      availableQuantity: 50,
      unitPrice: 2.5,
      unitType: 'kg',
      status: 'RECEIVED',
      imageUrl: 'http://example.com/pommes.jpg',
      createdAt: '2024-01-01',
      producerId: 1,
    },
    {
      id: 2,
      productName: 'Pommes',
      productType: 'Fruit',
      producerName: 'Ferme Bio',
      availabilityDate: '2024-01-05',
      availableQuantity: 50,
      unitPrice: 2.5,
      unitType: 'kg',
      status: 'RECEIVED',
      imageUrl: 'http://example.com/pommes.jpg',
      createdAt: '2024-01-05',
      producerId: 1,
    },
    {
      id: 3,
      productName: 'Carottes',
      productType: 'Légume',
      producerName: 'Ferme Verte',
      availabilityDate: '2024-01-02',
      availableQuantity: 80,
      unitPrice: 1.8,
      unitType: 'kg',
      status: 'RECEIVED',
      imageUrl: 'http://example.com/carottes.jpg',
      createdAt: '2024-01-02',
      producerId: 2,
    },
  ]

  const fetchReceivedBatchesMock = vi.fn().mockResolvedValue(undefined)

  const mockUserContextValue = {
    authenticatedUser: {
      id: 1,
      name: 'Test',
      firstname: 'Manager',
      email: 'manager@example.com',
      role: 'Manager',
      token: 'mock-token',
    },
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    registerUser: vi.fn(),
    clearUser: vi.fn(),
    authsMe: vi.fn(),
  } as unknown as UserContextType

  const mockProductContextValue = {
    products: mockProducts,
    isLoading: false,
    error: null,
    fetchProducts: vi.fn(),
    getProductById: vi.fn((id: number) =>
      mockProducts.find((p) => p.productId === id)
    ),
    fetchAllProducts: vi.fn(),
    allProducts: [],
    loadingAllProducts: false,
  } as unknown as ProductContextType

  const mockBatchContextValue = {
    receivedBatches: mockReceivedBatches,
    isLoading: false,
    error: null,
    fetchReceivedBatches: fetchReceivedBatchesMock,
  } as unknown as BatchContextType

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigateMock)
  })

  const renderWithContexts = (
    userContext = mockUserContextValue,
    productContext = mockProductContextValue,
    batchContext = mockBatchContextValue
  ) => {
    return render(
      <MemoryRouter>
        <UserContext.Provider value={userContext}>
          <ProductContext.Provider value={productContext}>
            <BatchContext.Provider value={batchContext}>
              <ReceivedProductsPage />
            </BatchContext.Provider>
          </ProductContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    )
  }

  test('redirects to home when user is not authenticated', () => {
    const unauthenticatedContext = {
      ...mockUserContextValue,
      authenticatedUser: null,
    } as unknown as UserContextType

    renderWithContexts(unauthenticatedContext)

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('redirects to home when user is not a manager', () => {
    const nonManagerContext = {
      ...mockUserContextValue,
      authenticatedUser: {
        ...mockUserContextValue.authenticatedUser,
        role: 'Client',
      },
    } as unknown as UserContextType

    renderWithContexts(nonManagerContext)

    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('displays loading state when fetching data', () => {
    const loadingProductContext = {
      ...mockProductContextValue,
      isLoading: true,
    } as unknown as ProductContextType

    renderWithContexts(mockUserContextValue, loadingProductContext)

    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  test('displays error state when product fetch fails', async () => {
    const errorProductContext = {
      ...mockProductContextValue,
      error: 'Failed to load products',
      isLoading: false,
    } as unknown as ProductContextType

    renderWithContexts(mockUserContextValue, errorProductContext)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load products/i)).toBeTruthy()
    })
  })

  test('displays error state when batch fetch fails', async () => {
    const errorBatchContext = {
      ...mockBatchContextValue,
      error: 'Failed to load batches',
      isLoading: false,
    } as unknown as BatchContextType

    renderWithContexts(
      mockUserContextValue,
      mockProductContextValue,
      errorBatchContext
    )

    await waitFor(() => {
      expect(screen.getByText(/Failed to load batches/i)).toBeTruthy()
    })
  })

  test('displays empty state when no products are available', async () => {
    const emptyProductContext = {
      ...mockProductContextValue,
      products: [],
      isLoading: false,
    } as unknown as ProductContextType

    renderWithContexts(mockUserContextValue, emptyProductContext)

    await waitFor(() => {
      expect(
        screen.getByText(/Aucun produit reçu disponible actuellement/i)
      ).toBeTruthy()
    })
  })

  test('displays product cards with correct information', async () => {
    renderWithContexts()

    await waitFor(() => {
      expect(screen.getByText('Pommes')).toBeTruthy()
      expect(screen.getByText('Carottes')).toBeTruthy()
      const fruitChips = screen.getAllByText('Fruit')
      expect(fruitChips.length).toBeGreaterThan(0)
      const legumeChips = screen.getAllByText('Légume')
      expect(legumeChips.length).toBeGreaterThan(0)
      expect(screen.getByText('Pommes bio rouges')).toBeTruthy()
      expect(screen.getByText('Carottes fraîches')).toBeTruthy()
    })
  })

  test('calculates total stock correctly', async () => {
    renderWithContexts()

    await waitFor(() => {
      expect(screen.getByText('100 en stock')).toBeTruthy()
      expect(screen.getByText('80 en stock')).toBeTruthy()
    })
  })

  test('displays batch details in table', async () => {
    renderWithContexts()

    await waitFor(() => {
      const dateHeaders = screen.getAllByText('Date réception')
      expect(dateHeaders.length).toBeGreaterThan(0)

      const producerHeaders = screen.getAllByText('Producteur')
      expect(producerHeaders.length).toBeGreaterThan(0)

      const quantityHeaders = screen.getAllByText('Quantité')
      expect(quantityHeaders.length).toBeGreaterThan(0)

      const priceHeaders = screen.getAllByText('Prix')
      expect(priceHeaders.length).toBeGreaterThan(0)

      const unitHeaders = screen.getAllByText('Unité')
      expect(unitHeaders.length).toBeGreaterThan(0)

      expect(screen.getAllByText('Ferme Bio').length).toBeGreaterThan(0)
      expect(screen.getByText('Ferme Verte')).toBeTruthy()

      expect(screen.getAllByText('50').length).toBeGreaterThan(0)
      expect(screen.getByText('80')).toBeTruthy()
    })
  })

  test('fetches received batches on component mount', async () => {
    renderWithContexts()

    expect(fetchReceivedBatchesMock).toHaveBeenCalledTimes(1)
  })

  test('throws error when ProductContext is null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <MemoryRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <ProductContext.Provider
              value={null as unknown as ProductContextType}
            >
              <BatchContext.Provider value={mockBatchContextValue}>
                <ReceivedProductsPage />
              </BatchContext.Provider>
            </ProductContext.Provider>
          </UserContext.Provider>
        </MemoryRouter>
      )
    ).toThrow()

    errorSpy.mockRestore()
  })

  test('throws error when BatchContext is null', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <MemoryRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <ProductContext.Provider value={mockProductContextValue}>
              <BatchContext.Provider
                value={null as unknown as BatchContextType}
              >
                <ReceivedProductsPage />
              </BatchContext.Provider>
            </ProductContext.Provider>
          </UserContext.Provider>
        </MemoryRouter>
      )
    ).toThrow()

    errorSpy.mockRestore()
  })

  test('handles missing product description gracefully', async () => {
    const productsWithMissingDescription = [
      {
        ...mockProducts[0],
        description: undefined,
      },
    ]

    const customProductContext = {
      ...mockProductContextValue,
      products: productsWithMissingDescription,
      isLoading: false,
    } as unknown as ProductContextType

    renderWithContexts(mockUserContextValue, customProductContext)

    await waitFor(() => {
      expect(screen.getByText('Aucune description disponible.')).toBeTruthy()
    })
  })
})
