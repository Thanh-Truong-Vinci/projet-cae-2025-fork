import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import HomePage from './HomePage'
import { ProductContext } from '../../contexts/ProductContext'
import { ReservationContext } from '../../contexts/ReservationContext'

// Mock useNavigate et useLocation
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: null }),
  }
})

// Mocks de données
const mockProducts = [
  {
    productId: 1,
    productName: 'Pommes',
    productType: 'Fruit',
    description: 'Pommes rouges bio',
    unitPrice: 2.5,
    saleUnit: 'kg',
    totalQuantity: 100,
    companyName: 'Ferme Bio',
    imageLocation: '/images/apple.jpg',
    earliestProductionDate: '2023-05-01',
    batchIds: [1],
    batchQuantities: [100],
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
    imageLocation: '/images/carrot.jpg',
    earliestProductionDate: '2023-05-02',
    batchIds: [2],
    batchQuantities: [80],
  },
]

const mockAllProducts = [
  {
    id: 1,
    name: 'Pommes',
    image: '/images/apple.jpg',
    description: 'Pommes rouges bio', // Ajouté
  },
  {
    id: 2,
    name: 'Carottes',
    image: '/images/carrot.jpg',
    description: 'Carottes fraîches', // Ajouté
  },
]

const mockProductContext = {
  products: mockProducts, // ProductBatch[]
  isLoading: false,
  error: null,
  fetchAllProducts: vi.fn(),
  allProducts: mockAllProducts, // Product[]
  loadingAllProducts: false, // <-- AJOUT OBLIGATOIRE
  getProductById: vi.fn(),
  getProductsByCategory: vi.fn(),
  getCategoryLabel: vi.fn(),
}

// Modifier cette ligne pour faire en sorte que mockCreateReservation retourne une Promise
const mockCreateReservation = vi.fn().mockResolvedValue({})
const mockReservationContext = {
  createReservation: mockCreateReservation,
  reservations: [],
  isLoading: false,
  error: null,
  fetchReservationsByUser: vi.fn(),
  fetchReservations: vi.fn(),
  fetchAllReservations: vi.fn(),
  toPendingReservation: vi.fn(),
  toConfirmReservation: vi.fn(),
  toRefusedReservation: vi.fn(),
  toCancelledReservation: vi.fn(),
  toCompletedReservation: vi.fn(),
  updateReservation: vi.fn(),
  cancelReservation: vi.fn(),
  updateReservationLineQuantity: vi.fn(),
  clearReservation: vi.fn(),
  removeReservationLine: vi.fn(),
  changeReservationLineQuantity: vi.fn(),
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('affiche un indicateur de chargement quand isLoading est true', () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider
          value={{ ...mockProductContext, isLoading: true }}
        >
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    // Vérifie la présence du loader
    expect(screen.getByRole('progressbar')).not.toBeNull()
  })

  test('affiche une erreur quand error est présent', () => {
    const errorMessage = 'Erreur de chargement'
    render(
      <MemoryRouter>
        <ProductContext.Provider
          value={{ ...mockProductContext, error: errorMessage }}
        >
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    expect(screen.getByText(errorMessage)).not.toBeNull()
  })

  test('affiche la liste des produits', () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockProductContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    // Ne PAS utiliser getByText ici, car il y a plusieurs "Pommes"
    expect(screen.getAllByText('Pommes').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Carottes').length).toBeGreaterThan(0)
  })

  test('filtre les produits par nom', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockProductContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    const nameInput = screen.getByPlaceholderText('Nom du produit')
    fireEvent.change(nameInput, { target: { value: 'Pommes' } })
    const confirmButton = screen.getByText('CONFIRMER')
    fireEvent.click(confirmButton)
    await waitFor(() => {
      expect(screen.getAllByText('Pommes').length).toBeGreaterThan(0)

      // Modification ici: au lieu de chercher 'Carottes' partout,
      // vérifiez qu'aucune carte de produit dans la liste filtrée ne contient 'Carottes'
      const productCards = screen
        .getAllByRole('button')
        .filter((el) => el.closest('.MuiCard-root'))
        .filter((card) => card.textContent?.includes('Carottes') || false)

      expect(productCards.length).toBe(0)
    })
  })

  test("modifie la quantité d'un produit", async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockProductContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    const addButtons = screen.getAllByRole('button')
    const plusButton = addButtons.find((btn) => btn.innerHTML.includes('svg'))
    if (plusButton) {
      fireEvent.click(plusButton)
    } else {
      throw new Error('Bouton + non trouvé')
    }
    await waitFor(() => {
      // Recherche simple par regex pour trouver le "2"
      expect(screen.getAllByText(/2/).length).toBeGreaterThan(0)
    })
  })

  test('ajoute un produit à la réservation', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockProductContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    // Cliquer sur le bouton "Ajouter à la réservation" du premier produit
    const addToCartButtons = screen.getAllByRole('button')
    // On prend le premier bouton qui contient l'icône AddShoppingCart
    const cartButton = addToCartButtons.find((btn) =>
      btn.innerHTML.includes('AddShoppingCartIcon')
    )
    if (cartButton) fireEvent.click(cartButton)

    // Attendre que le mock soit appelé
    await waitFor(() => {
      expect(mockCreateReservation).toHaveBeenCalled()
    })
  })

  test("navigue vers la page détaillée d'un produit lors du clic", () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockProductContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    const productTitles = screen.getAllByText('Pommes')
    const productCard = productTitles.find((el) => el.closest('.MuiCard-root'))
    if (productCard) fireEvent.click(productCard)
    expect(navigateMock).toHaveBeenCalled()
  })

  test('affiche un message quand aucun produit ne correspond aux critères', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockProductContext}>
          <ReservationContext.Provider value={mockReservationContext}>
            <HomePage />
          </ReservationContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>
    )
    const nameInput = screen.getByPlaceholderText('Nom du produit')
    fireEvent.change(nameInput, { target: { value: 'ProduitInexistant' } })
    const confirmButton = screen.getByText('CONFIRMER')
    fireEvent.click(confirmButton)
    await waitFor(() => {
      expect(
        screen.getByText(
          'Aucun produit ne correspond à vos critères de recherche.'
        )
      ).not.toBeNull()
    })
  })
})
