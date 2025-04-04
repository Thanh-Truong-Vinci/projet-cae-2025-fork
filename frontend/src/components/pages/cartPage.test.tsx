import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import CartPage from '../../components/pages/CartPage'
import { CartContext } from '../../contexts/CartContext'
import { UserContext } from '../../contexts/UserContext'
import { CartItem } from '../../types' // Import the CartItem type

// Mocking react-router-dom's useNavigate
const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

// Mocking Material UI icons
vi.mock('@mui/icons-material/Add', () => ({
  default: () => <div data-testid="mock-add-icon">+</div>,
}))

vi.mock('@mui/icons-material/Remove', () => ({
  default: () => <div data-testid="mock-remove-icon">-</div>,
}))

vi.mock('@mui/icons-material/Delete', () => ({
  default: () => <div data-testid="mock-delete-icon">×</div>,
}))

describe('CartPage', () => {
  // Mock data with the correct CartItem type
  const mockCartItems: CartItem[] = [
    {
      id: 1,
      name: 'Pommes Bio',
      price: '5.99€',
      image: 'https://example.com/apple.jpg',
      quantity: 2,
      category: 'fruits',
      unitType: 'kg', // Add the missing unitType property
    },
    {
      id: 2,
      name: 'Carottes',
      price: '3.50€',
      image: 'https://example.com/carrot.jpg',
      quantity: 1,
      category: 'légumes',
      unitType: 'kg', // Add the missing unitType property
    },
  ]

  // Explicitly define the type
  const mockEmptyCart: CartItem[] = []

  const mockAuthenticatedUser = {
    id: 1,
    name: 'Dupont',
    firstname: 'Jean',
    email: 'jean.dupont@example.com',
    role: 'Client',
    token: 'mock-token',
  }

  // Mock functions
  const mockAddToCart = vi.fn()
  const mockRemoveFromCart = vi.fn()
  const mockUpdateQuantity = vi.fn()
  const mockGetCartCount = vi.fn().mockReturnValue(3)
  const mockClearCart = vi.fn()

  // Local storage mock
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

  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
  })

  const renderWithContext = (
    cartItems = mockCartItems,
    authenticatedUser = mockAuthenticatedUser
  ) => {
    const cartContextValue = {
      cartItems,
      addToCart: mockAddToCart,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      getCartCount: mockGetCartCount,
      clearCart: mockClearCart,
    }

    const userContextValue = {
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
        <UserContext.Provider value={userContextValue}>
          <CartContext.Provider value={cartContextValue}>
            <CartPage />
          </CartContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    )
  }

  test('displays empty cart message when cart is empty', () => {
    renderWithContext(mockEmptyCart)

    expect(screen.getByText('Mon Panier')).toBeTruthy()
    expect(screen.getByText('Votre panier est vide')).toBeTruthy()

    const continueShoppingButton = screen.getByText('Continuer vos achats')
    expect(continueShoppingButton).toBeTruthy()

    fireEvent.click(continueShoppingButton)
    expect(mockedNavigate).toHaveBeenCalledWith('/')
  })

  test('displays cart items correctly', () => {
    renderWithContext()

    // Check title
    expect(screen.getByText('Mon Panier')).toBeTruthy()

    // Check if items are displayed
    expect(screen.getByText('Pommes Bio')).toBeTruthy()
    expect(screen.getByText('Carottes')).toBeTruthy()

    // Check prices - utiliser getAllByText au lieu de getByText pour des textes qui apparaissent plusieurs fois
    const priceElements = screen.getAllByText('5.99€')
    expect(priceElements.length).toBeGreaterThan(0)

    const carrotPriceElements = screen.getAllByText('3.50€')
    expect(carrotPriceElements.length).toBeGreaterThan(0)

    // Check total sum - c'est un élément unique et spécifique
    expect(screen.getByText('Total: 15.48€')).toBeTruthy()
  })

  test('can remove items from cart', () => {
    renderWithContext()

    // Find and click delete buttons (ensuring we get the actual button element)
    const deleteButtons = screen.getAllByTestId('mock-delete-icon')
    const deleteButton = deleteButtons[0].closest('button')
    if (deleteButton) {
      // Add null check
      fireEvent.click(deleteButton)
      expect(mockRemoveFromCart).toHaveBeenCalledWith(1) // First item ID
    }
  })

  test('can update item quantity', () => {
    renderWithContext()

    // Find quantity inputs
    const quantityInputs = screen.getAllByRole('spinbutton')

    // Update first item quantity directly
    fireEvent.change(quantityInputs[0], { target: { value: '5' } })
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 5)

    // Use increment button with null check
    const addButtons = screen.getAllByTestId('mock-add-icon')
    const addButton = addButtons[0].closest('button')
    if (addButton) {
      fireEvent.click(addButton)
      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3) // Original quantity + 1
    }

    // Use decrement button with null check
    const removeButtons = screen.getAllByTestId('mock-remove-icon')
    const removeButton = removeButtons[0].closest('button')
    if (removeButton) {
      fireEvent.click(removeButton)
      expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1) // Original quantity - 1
    }
  })

  test('can clear the cart', () => {
    renderWithContext()

    const clearCartButton = screen.getByText('Vider le panier')
    fireEvent.click(clearCartButton)

    expect(mockClearCart).toHaveBeenCalled()
  })

  test('opens calendar dialog when clicking reserve button', () => {
    renderWithContext()

    const reserveButton = screen.getByText('Réserver')
    fireEvent.click(reserveButton)

    // Dialog should appear
    expect(screen.getByText('Choisissez une date de retrait')).toBeTruthy()
    // Utiliser le bon libellé mis à jour dans le composant
    expect(screen.getByLabelText('Date de retrait (mardi ou jeudi)')).toBeTruthy()
  })

  test('validates selected date in calendar', () => {
    renderWithContext()

    // Open calendar
    const reserveButton = screen.getByText('Réserver')
    fireEvent.click(reserveButton)

    // Get date input avec le bon libellé
    const dateInput = screen.getByLabelText('Date de retrait (mardi ou jeudi)')

    // Set a date in the past (should be invalid)
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    const pastDateString = pastDate.toISOString().split('T')[0]

    fireEvent.change(dateInput, { target: { value: pastDateString } })

    // Confirm button should be disabled
    const confirmButton = screen.getByText('Confirmer la réservation')
    expect(confirmButton.hasAttribute('disabled')).toBe(true)

    // Should show error message - le message a changé dans le composant
    expect(screen.getByText('Veuillez choisir un mardi ou un jeudi après la date d\'aujourd\'hui.')).toBeTruthy()

    // Set a valid future date (mardi ou jeudi)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)
    // S'assurer que la date est un mardi ou jeudi
    while (futureDate.getDay() !== 2 && futureDate.getDay() !== 4) {
      futureDate.setDate(futureDate.getDate() + 1)
    }
    const futureDateString = futureDate.toISOString().split('T')[0]

    fireEvent.change(dateInput, { target: { value: futureDateString } })

    // Should display selected date
    expect(screen.getByText(/Date sélectionnée:/)).toBeTruthy()

    // Confirm button should be enabled
    expect(confirmButton.hasAttribute('disabled')).toBe(false)
  })

  test('creates reservation and redirects after confirmation', () => {
    // Utiliser vi.spyOn pour Vitest (pas jest.spyOn)
    vi.spyOn(window.localStorage, 'setItem')
    vi.spyOn(window.localStorage, 'getItem')

    renderWithContext()

    // Open calendar
    const reserveButton = screen.getByText('Réserver')
    fireEvent.click(reserveButton)

    // Set a valid date (mardi ou jeudi)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)
    // S'assurer que la date est un mardi ou jeudi
    while (futureDate.getDay() !== 2 && futureDate.getDay() !== 4) {
      futureDate.setDate(futureDate.getDate() + 1)
    }
    const futureDateString = futureDate.toISOString().split('T')[0]

    const dateInput = screen.getByLabelText('Date de retrait (mardi ou jeudi)')
    fireEvent.change(dateInput, { target: { value: futureDateString } })

    // Confirm reservation
    const confirmButton = screen.getByText('Confirmer la réservation')
    fireEvent.click(confirmButton)

    // Should save to localStorage
    expect(window.localStorage.setItem).toHaveBeenCalled()

    // Should clear cart
    expect(mockClearCart).toHaveBeenCalled()

    // Should navigate to home with success message
    expect(mockedNavigate).toHaveBeenCalledWith(
      '/',
      expect.objectContaining({
        state: expect.objectContaining({
          message: expect.stringContaining('a été enregistrée avec succès'),
        }),
      })
    )
  })
})