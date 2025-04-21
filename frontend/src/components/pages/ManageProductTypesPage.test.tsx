import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ManageProductTypesPage from '../../components/pages/ManageProductTypesPage'
import { UserContext } from '../../contexts/UserContext'
import { ProductTypeContext } from '../../contexts/ProductTypeContext'
import { BrowserRouter } from 'react-router-dom'
import { ReactNode } from 'react'
import {
  ProductType,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
} from '../../types'

// Mocks pour react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock des composants MUI qui peuvent causer des problèmes dans les tests
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material')
  return {
    ...actual,
    CircularProgress: () => (
      <div data-testid="mock-circular-progress">Loading...</div>
    ),
    Dialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
      open ? <div data-testid="mock-dialog">{children}</div> : null,
    DialogTitle: ({ children }: { children: ReactNode }) => (
      <div data-testid="mock-dialog-title">{children}</div>
    ),
    DialogContent: ({ children }: { children: ReactNode }) => (
      <div data-testid="mock-dialog-content">{children}</div>
    ),
    DialogContentText: ({ children }: { children: ReactNode }) => (
      <div data-testid="mock-dialog-text">{children}</div>
    ),
    DialogActions: ({ children }: { children: ReactNode }) => (
      <div data-testid="mock-dialog-actions">{children}</div>
    ),
    TextField: ({
      label,
      onChange,
      value,
      ...props
    }: {
      label?: string
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
      value?: string
      [key: string]: unknown
    }) => (
      <input
        data-testid="mock-text-field"
        aria-label={label}
        value={value || ''}
        onChange={onChange}
        {...props}
      />
    ),
    Alert: ({
      severity,
      children,
    }: {
      severity: string
      children: ReactNode
    }) => <div data-testid={`mock-alert-${severity}`}>{children}</div>,
  }
})

describe('ManageProductTypesPage', () => {
  // Mocks pour les contextes
  const mockProductTypes: ProductType[] = [
    { id: 1, title: 'Légume' },
    { id: 2, title: 'Fruit' },
    { id: 3, title: 'Viande' },
  ]

  const mockAuthenticatedManager: AuthenticatedUser = {
    email: 'manager@example.com',
    name: 'Doe',
    firstname: 'John',
    token: 'mock-token',
    role: 'Manager',
  }

  const mockAuthenticatedNonManager: AuthenticatedUser = {
    email: 'producer@example.com',
    name: 'Smith',
    firstname: 'Jane',
    token: 'mock-token',
    role: 'Producer',
  }

  // Fonctions mockées pour le contexte ProductType
  const mockFetchProductTypes = vi.fn().mockResolvedValue(undefined)

  const mockAddProductType = vi.fn().mockImplementation(() => {
    return Promise.resolve(true)
  })

  const mockDeleteProductType = vi.fn().mockImplementation(() => {
    return Promise.resolve({ success: true, constraintViolation: false })
  })

  const mockDeleteProductTypeWithConstraint = vi.fn().mockImplementation(() => {
    return Promise.resolve({ success: false, constraintViolation: true })
  })

  // Fonctions pour rendre le composant avec différents contextes
  const renderWithContexts = (
    authenticatedUser: MaybeAuthenticatedUser = mockAuthenticatedManager,
    productTypes: ProductType[] = mockProductTypes,
    loading: boolean = false,
    error: string | null = null,
    addProductType = mockAddProductType,
    deleteProductType = mockDeleteProductType
  ) => {
    return render(
      <BrowserRouter>
        <UserContext.Provider
          value={{
            authenticatedUser,
            authsMe: vi.fn(),
            registerUser: vi.fn(),
            registerManager: vi.fn(),
            registerProducer: vi.fn(),
            loginUser: vi.fn(),
            clearUser: vi.fn(),
            changePassword: vi.fn(),
          }}
        >
          <ProductTypeContext.Provider
            value={{
              productTypes,
              loading,
              error,
              addProductType,
              deleteProductType,
              fetchProductTypes: mockFetchProductTypes,
            }}
          >
            <ManageProductTypesPage />
          </ProductTypeContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>
    )
  }

  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("redirige vers la page d'accueil si l'utilisateur n'est pas authentifié", async () => {
    renderWithContexts({} as MaybeAuthenticatedUser) // utilisateur vide → déclenche le if dans useEffect
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  test("redirige vers la page d'accueil si l'utilisateur n'est pas un manager", async () => {
    renderWithContexts(mockAuthenticatedNonManager) // rôle = Producer
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  test('affiche les types de produits correctement', () => {
    renderWithContexts()

    expect(screen.getByText('Gestion des Types de Produits')).toBeTruthy()
    expect(screen.getByText('Légume')).toBeTruthy()
    expect(screen.getByText('Fruit')).toBeTruthy()
    expect(screen.getByText('Viande')).toBeTruthy()
  })

  test("affiche un message quand il n'y a pas de types de produits", () => {
    renderWithContexts(mockAuthenticatedManager, [])

    expect(screen.getByText('Aucun type de produit disponible.')).toBeTruthy()
  })

  test('affiche un indicateur de chargement quand loading est true', () => {
    renderWithContexts(mockAuthenticatedManager, mockProductTypes, true)

    expect(screen.getByTestId('mock-circular-progress')).toBeTruthy()
  })

  test("affiche un message d'erreur quand il y a une erreur", () => {
    const errorMessage = 'Erreur lors du chargement des types de produits'
    renderWithContexts(
      mockAuthenticatedManager,
      mockProductTypes,
      false,
      errorMessage
    )

    expect(screen.getByTestId('mock-alert-error')).toBeTruthy()
    expect(screen.getByText(errorMessage)).toBeTruthy()
  })

  test("ouvre la boîte de dialogue d'ajout lors du clic sur le bouton Ajouter", () => {
    renderWithContexts()

    const addButton = screen.getByRole('button', { name: /Ajouter un Type/i })
    fireEvent.click(addButton)

    expect(screen.getByTestId('mock-dialog')).toBeTruthy()
    expect(screen.getByTestId('mock-dialog-title').textContent).toBe(
      'Ajouter un nouveau type de produit'
    )
  })

  test('ajoute un nouveau type de produit', async () => {
    renderWithContexts()

    // Ouvrir la boîte de dialogue d'ajout
    const addButton = screen.getByRole('button', { name: /Ajouter un Type/i })
    fireEvent.click(addButton)

    // Entrer un nouveau type
    const input = screen.getByTestId('mock-text-field')
    fireEvent.change(input, { target: { value: 'Produits laitiers' } })

    // Cliquer sur le bouton Ajouter dans la boîte de dialogue
    const confirmButton = screen.getByRole('button', { name: /^Ajouter$/i })
    fireEvent.click(confirmButton)

    // Vérifier que la fonction d'ajout a été appelée avec le bon titre
    await waitFor(() => {
      expect(mockAddProductType).toHaveBeenCalledWith('Produits laitiers')
    })

    // Vérifier que le message de succès est affiché
    expect(screen.getByTestId('mock-alert-success')).toBeTruthy()
    expect(screen.getByText('Type ajouté avec succès')).toBeTruthy()
  })

  test("ouvre la boîte de dialogue de suppression lors du clic sur l'icône de suppression", () => {
    renderWithContexts()

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    expect(screen.getByTestId('mock-dialog')).toBeTruthy()
    expect(screen.getByTestId('mock-dialog-title').textContent).toBe(
      'Confirmer la suppression'
    )
  })

  test('supprime un type de produit avec succès', async () => {
    renderWithContexts()

    // Ouvrir la boîte de dialogue de suppression
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    // Cliquer sur le bouton Supprimer dans la boîte de dialogue
    const confirmButton = screen.getByRole('button', { name: /^Supprimer$/i })
    fireEvent.click(confirmButton)

    // Vérifier que la fonction de suppression a été appelée avec le bon id
    await waitFor(() => {
      expect(mockDeleteProductType).toHaveBeenCalledWith(1)
    })

    // Vérifier que le message de succès est affiché
    expect(screen.getByTestId('mock-alert-success')).toBeTruthy()
    expect(screen.getByText('Type supprimé avec succès')).toBeTruthy()
  })

  test('affiche un avertissement quand un type ne peut pas être supprimé à cause de contraintes', async () => {
    renderWithContexts(
      mockAuthenticatedManager,
      mockProductTypes,
      false,
      null,
      mockAddProductType,
      mockDeleteProductTypeWithConstraint
    )

    // Ouvrir la boîte de dialogue de suppression
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    // Cliquer sur le bouton Supprimer dans la boîte de dialogue
    const confirmButton = screen.getByRole('button', { name: /^Supprimer$/i })
    fireEvent.click(confirmButton)

    // Vérifier que la fonction de suppression a été appelée avec le bon id
    await waitFor(() => {
      expect(mockDeleteProductTypeWithConstraint).toHaveBeenCalledWith(1)
    })

    // Vérifier que le message d'avertissement est affiché
    expect(screen.getByTestId('mock-alert-warning')).toBeTruthy()
    expect(
      screen.getByText(
        'Ce type de produit ne peut pas être supprimé car il est actuellement utilisé par des produits'
      )
    ).toBeTruthy()
  })
})
