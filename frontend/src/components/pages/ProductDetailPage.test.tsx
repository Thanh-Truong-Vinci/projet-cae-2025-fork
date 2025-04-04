import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useParams, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ProductDetailPage from '../../components/pages/ProductDetailPage'
import { CartContext } from '../../contexts/CartContext'

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  }
})

// Mock fetch API
global.fetch = vi.fn()

describe('ProductDetailPage', () => {
  // Setup common test variables
  const productId = '1'
  // Removed unused mockProduct declaration

  const navigateMock = vi.fn()
  const addToCartMock = vi.fn()

  // Setup default mock context
  const mockCartContext = {
    cartItems: [],
    addToCart: addToCartMock,
    removeFromCart: vi.fn(),
    updateQuantity: vi.fn(),
    getCartCount: vi.fn(),
    clearCart: vi.fn(),
  }

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    vi.mocked(useParams).mockReturnValue({ productId })
    vi.mocked(useNavigate).mockReturnValue(navigateMock)

    // Mock successful fetch response
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          name: 'Test Product',
          photo: { url: 'https://via.placeholder.com/300' },
          description: 'This is a test product description',
          unitType: 'unité',
          type: { title: 'vegetables' },
        }),
    } as Response)
  })

  test('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getByText('Chargement...')).toBeTruthy()
  })

  test('displays product details after loading', async () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Check that fetch was called with the correct URL
    expect(fetch).toHaveBeenCalledWith('/api/products/1')

    // Wait for product details to load - use heading selector to be specific
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Product' })).toBeTruthy()
    })

    // Verify product details are displayed
    expect(screen.getByText('This is a test product description')).toBeTruthy()
    expect(screen.getByText('10.00€')).toBeTruthy()
    expect(screen.getByText('Quantité:')).toBeTruthy()

    // Check that the image is present
    const productImage = screen.getByAltText('Test Product')
    expect(productImage).toBeTruthy()
    expect(productImage.getAttribute('src')).toBe(
      'https://via.placeholder.com/300'
    )

    // Check that the add to cart button is present
    const addToCartButton = screen.getByText('Ajouter au panier')
    expect(addToCartButton).toBeTruthy()
  })

  test('handles quantity increment and decrement', async () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Wait for product details to load - use heading selector to be specific
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Product' })).toBeTruthy()
    })

    // Find the quantity section by finding element with "Quantité:" first
    const quantityText = screen.getByText('Quantité:')
    const quantityContainer = quantityText.closest('.MuiBox-root')

    // Check initial quantity is 1
    const quantityValue = quantityContainer?.querySelector(
      'p.MuiTypography-body1:not(:first-child)'
    )
    expect(quantityValue).toBeTruthy()
    expect(quantityValue?.textContent).toBe('1')

    // Find increment and decrement buttons
    const incrementButton = screen.getByTestId('AddIcon').closest('button')
    const decrementButton = screen.getByTestId('RemoveIcon').closest('button')

    if (incrementButton && decrementButton) {
      // Increment quantity
      fireEvent.click(incrementButton)
      expect(quantityValue?.textContent).toBe('2')

      // Increment again
      fireEvent.click(incrementButton)
      expect(quantityValue?.textContent).toBe('3')

      // Decrement quantity
      fireEvent.click(decrementButton)
      expect(quantityValue?.textContent).toBe('2')

      // Verify quantity can't go below 1
      fireEvent.click(decrementButton)
      fireEvent.click(decrementButton)
      expect(quantityValue?.textContent).toBe('1')
    } else {
      throw new Error('Increment/decrement buttons not found')
    }
  })

  test('adds product to cart with correct quantity', async () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Wait for product details to load - use heading selector to be specific
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Product' })).toBeTruthy()
    })

    // Increment quantity to 3
    const incrementButton = screen.getByTestId('AddIcon').closest('button')
    if (incrementButton) {
      fireEvent.click(incrementButton)
      fireEvent.click(incrementButton)
    } else {
      throw new Error('Increment button not found')
    }

    // Verify quantity is now 3
    const quantityText = screen.getByText('Quantité:')
    const quantityContainer = quantityText.closest('.MuiBox-root')
    const quantityValue = quantityContainer?.querySelector(
      'p.MuiTypography-body1:not(:first-child)'
    )
    expect(quantityValue?.textContent).toBe('3')

    // Click the add to cart button
    const addToCartButton = screen.getByText('Ajouter au panier')
    fireEvent.click(addToCartButton)

    // Verify addToCart was called with the correct product and quantity
    expect(addToCartMock).toHaveBeenCalledWith({
      id: 1,
      name: 'Test Product',
      price: '10.00€',
      image: 'https://via.placeholder.com/300',
      quantity: 3,
      unitType: 'unité',
      category: 'vegetables',
    })
  })

  test('navigates back when clicking back button', async () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Wait for product details to load - use heading selector to be specific
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Product' })).toBeTruthy()
    })

    // Click the back button - use exact text match to be specific
    const backButton = screen.getByText('Retour aux produits', { exact: true })
    fireEvent.click(backButton)

    // Verify navigation was called
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('displays error when product fetch fails', async () => {
    // Mock a failed fetch
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response)

    render(
      <MemoryRouter initialEntries={['/products/999']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Wait for error to display
    await waitFor(() => {
      expect(
        screen.getByText('Impossible de charger les détails du produit')
      ).toBeTruthy()
    })

    // Check that the back to home button exists
    const homeButton = screen.getByText("Retour à l'accueil")
    expect(homeButton).toBeTruthy()

    // Click the home button
    fireEvent.click(homeButton)

    // Verify navigation was called
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('handles network error during fetch', async () => {
    // Mock a network error
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Wait for error to display
    await waitFor(() => {
      expect(
        screen.getByText('Impossible de charger les détails du produit')
      ).toBeTruthy()
    })
  })

  test('breadcrumbs navigation works', async () => {
    render(
      <MemoryRouter initialEntries={['/products/1']}>
        <CartContext.Provider value={mockCartContext}>
          <ProductDetailPage />
        </CartContext.Provider>
      </MemoryRouter>
    )

    // Wait for product details to load - use heading selector to be specific
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Test Product' })).toBeTruthy()
    })

    // Find and click the home link in breadcrumbs - use text selector since it might not have proper role
    const homeLink = screen.getByText('Accueil')
    fireEvent.click(homeLink)

    // Verify navigation was called
    expect(navigateMock).toHaveBeenCalledWith('/')
  })
})
