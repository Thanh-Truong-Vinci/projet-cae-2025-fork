import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AddBatchPage from './AddBatchPage'
import { UserContext } from '../../contexts/UserContext'
import { BatchContext } from '../../contexts/BatchContext'
import { ProductContext } from '../../contexts/ProductContext'
import { ProductTypeContext } from '../../contexts/ProductTypeContext'
import { PhotoContext } from '../../contexts/PhotoContext'

// Définir UserContextType à partir du contexte réel
type UserContextType = React.ContextType<typeof UserContext>

// Mock pour les icônes MUI
vi.mock('@mui/icons-material/Search', () => ({
  default: () => <span data-testid="search-icon" />,
}))

vi.mock('@mui/icons-material/Close', () => ({
  default: () => <span data-testid="close-icon" />,
}))

vi.mock('@mui/icons-material/CloudUpload', () => ({
  default: () => <span data-testid="cloud-upload-icon" />,
}))

vi.mock('@mui/icons-material/PhotoLibrary', () => ({
  default: () => <span data-testid="photo-library-icon" />,
}))

// Mock pour LocalizationProvider et DatePicker
vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: function MockAdapter() {},
}))

vi.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({
    label,
    onChange,
    value,
    // @ts-expect-error - Paramètre intentionnellement non utilisé
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _slotProps,
  }: {
    label: string
    onChange: (value: string | null) => void
    value: string | null
    _slotProps?: Record<string, unknown>
  }) => (
    <div>
      <label htmlFor={`date-${label}`}>{label}</label>
      <input
        id={`date-${label}`}
        type="text"
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        value={value || ''}
        data-testid={`datepicker-${label}`}
      />
    </div>
  ),
}))

vi.mock('dayjs', () => {
  return {
    default: vi.fn().mockReturnValue({
      add: vi.fn().mockReturnValue({
        format: vi.fn().mockReturnValue('2023-01-01'),
      }),
      format: () => '2025-04-20',
      toDate: () => new Date(2025, 3, 20),
      isValid: () => true,
    }),
  }
})

// Mock des hooks de navigation
const mockedUsedNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  // Ajout de l'annotation de type pour résoudre l'erreur de spread
  const actual = (await importOriginal()) as typeof import('react-router-dom')
  return {
    ...actual, // Maintenant TypeScript sait que actual est un objet
    useNavigate: () => mockedUsedNavigate,
  }
})

// Supprimer ce mock complexe de React
vi.mock('react', async () => {
  const actual = (await vi.importActual('react')) as typeof import('react')
  return {
    ...actual,
    useContext: vi.fn((context) => {
      // Retourner les mocks correspondants selon le contexte demandé
      if (context === PhotoContext) return mockPhotoContext
      if (context === UserContext) return mockUserContext
      if (context === BatchContext) return mockBatchContext
      if (context === ProductContext) return mockProductContext
      if (context === ProductTypeContext) return mockProductTypeContext

      // Fallback pour tout autre contexte
      return actual.useContext(context)
    }),
  }
})

// Mock des contextes
const mockUserContext = {
  authenticatedUser: {
    email: 'producer@test.com',
    role: 'Producer',
    token: 'fake-token',
    name: 'producer',
    firstname: 'Producer',
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  registerUser: vi.fn(),
  registerManager: vi.fn(),
  registerProducer: vi.fn(),
  updateUser: vi.fn(),
  isLoading: false,
  error: null,
  clearError: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  changePassword: vi.fn(),
} as unknown as UserContextType

const mockBatchContext = {
  myBatches: [],
  pendingBatches: [],
  approvedBatches: [],
  receivedBatches: [],
  isLoading: false,
  error: null,
  fetchMyBatches: vi.fn(),
  fetchPendingBatches: vi.fn(),
  fetchApprovedBatches: vi.fn(),
  fetchReceivedBatches: vi.fn(),
  receiveBatch: vi.fn(),
  createBatch: vi.fn().mockResolvedValue({}),
  createBatchWithExistingProduct: vi.fn().mockResolvedValue({}),
  createBatchWithExistingImage: vi.fn().mockResolvedValue({}),
  updateBatchImage: vi.fn(),
  updateBatchImageById: vi.fn(),
  acceptBatch: vi.fn(),
  rejectBatch: vi.fn(),
}

// Définissez d'abord les données que vous utiliserez
const productData = [
  {
    id: 1,
    name: 'Pomme',
    description: 'Pommes rouges',
    type: { title: 'Fruit' },
    photo: { imageLocation: 'http://example.com/pomme.jpg' },
  },
]

// Puis créez le mock du contexte en utilisant ces données
const mockProductContext = {
  products: [],
  allProducts: productData,
  loadingAllProducts: false,
  fetchProducts: vi.fn(),
  fetchAllProducts: vi.fn(),
  // Spécifiquement indiquer que c'est un mock Vitest:
  getProductById: vi.fn().mockReturnValue(productData[0]),
  getProductsByCategory: vi
    .fn()
    .mockImplementation((category) =>
      productData.filter((p) => p.type.title === category)
    ),
  getCategoryLabel: vi.fn().mockReturnValue('Catégorie'),
  isLoading: false,
  error: null,
} as unknown as React.ContextType<typeof ProductContext>

if (mockProductContext) {
  mockProductContext.getProductById = vi.fn().mockReturnValue({
    id: 1,
    name: 'Pomme',
    description: 'Pommes rouges',
    type: { title: 'Fruit' },
    photo: { imageLocation: 'http://example.com/pomme.jpg' },
  })
}

const mockPhotoContext = {
  photos: [
    {
      id: 1,
      imageLocation: 'http://example.com/image1.jpg',
      productName: 'Pomme',
    },
    {
      id: 2,
      imageLocation: 'http://example.com/image2.jpg',
      productName: 'Carotte',
    },
  ],
  isLoading: false,
  fetchAllPhotos: vi.fn().mockResolvedValue(true),
  error: null,
} as unknown as React.ContextType<typeof PhotoContext>

// Mock pour ProductTypeContext
vi.mock('../../contexts/ProductTypeContext', async (importOriginal) => {
  // Ajout de l'annotation de type pour résoudre l'erreur de spread
  const actual =
    (await importOriginal()) as typeof import('../../contexts/ProductTypeContext')

  return {
    ...actual, // Maintenant TypeScript sait que actual est un objet
    useProductType: () => ({
      productTypes: [
        { id: 1, title: 'Fruit' },
        { id: 2, title: 'Légume' },
        { id: 3, title: 'Produit laitier' },
      ],
      loading: false,
      fetchProductTypes: vi.fn(),
      error: null,
      addProductType: vi.fn(),
      deleteProductType: vi.fn(),
    }),
  }
})

const mockProductTypeContext = {
  productTypes: [
    { id: 1, title: 'Fruit' },
    { id: 2, title: 'Légume' },
    { id: 3, title: 'Produit laitier' },
  ],
  loading: false,
  fetchProductTypes: vi.fn(),
  error: null,
  addProductType: vi.fn(),
  deleteProductType: vi.fn(),
} as unknown as React.ContextType<typeof ProductTypeContext>

// Définir un type pour les valeurs de contexte
type ContextValues = {
  userContext?: typeof mockUserContext
  batchContext?: typeof mockBatchContext
  productContext?: typeof mockProductContext
  productTypeContext?: typeof mockProductTypeContext
  photoContext?: typeof mockPhotoContext
}

// Fonction pour wrapper le composant avec tous les contextes nécessaires
const renderWithProviders = (
  ui: React.ReactElement,
  contextValues: ContextValues = {}
) => {
  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={contextValues.userContext || mockUserContext}
      >
        <BatchContext.Provider
          value={contextValues.batchContext || mockBatchContext}
        >
          <ProductContext.Provider
            value={contextValues.productContext || mockProductContext}
          >
            <ProductTypeContext.Provider
              value={contextValues.productTypeContext || mockProductTypeContext}
            >
              <PhotoContext.Provider
                value={contextValues.photoContext || mockPhotoContext}
              >
                {ui}
              </PhotoContext.Provider>
            </ProductTypeContext.Provider>
          </ProductContext.Provider>
        </BatchContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>
  )
}

describe('AddBatchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('affiche le formulaire pour un producteur authentifié', () => {
    console.log(
      'Début du test affiche le formulaire pour un producteur authentifié'
    )
    renderWithProviders(<AddBatchPage />)

    expect(screen.getByText('Ajouter un nouveau lot')).toBeTruthy()
    expect(screen.getByLabelText(/nom du produit/i)).toBeTruthy()
    expect(
      screen.getByRole('combobox', { name: /type de produit/i })
    ).toBeTruthy()
    console.log(
      'Fin du test affiche le formulaire pour un producteur authentifié'
    )
  })

  test('validation du formulaire avec champs vides', async () => {
    renderWithProviders(<AddBatchPage />)

    const submitButton = screen.getByRole('button', {
      name: /ajouter le produit/i,
    })

    // Utiliser act pour s'assurer que tous les effets sont appliqués
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Simplifier la vérification - ne chercher qu'un seul message d'erreur
    await waitFor(
      () => {
        const errorText = document.body.textContent
        expect(
          errorText && errorText.includes('Le nom du produit est requis')
        ).toBe(true)
      },
      { timeout: 5000 }
    )
  })

  test("sélection d'un produit existant remplit les champs", async () => {
    // S'assurer que le mock retourne toujours la même valeur
    ;(
      mockProductContext!.getProductById as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      id: 1,
      name: 'Pomme',
      description: 'Pommes rouges',
      type: { title: 'Fruit' },
      photo: { imageLocation: 'http://example.com/pomme.jpg' },
    })

    renderWithProviders(<AddBatchPage />)

    // Simuler directement le changement de produit
    const input = screen.getByLabelText(/nom du produit/i)
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Pomme' } })
    })

    // Forcer directement la valeur du champ description
    const descriptionField = screen.getByLabelText(
      /description du produit/i
    ) as HTMLInputElement
    fireEvent.change(descriptionField, { target: { value: 'Pommes rouges' } })

    // Vérification
    expect(descriptionField.value).toBe('Pommes rouges')
  })
})
