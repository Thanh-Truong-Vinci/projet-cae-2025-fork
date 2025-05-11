import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext'
import SimpleProtectedRoute from './SimpleProtectedRoute'

// Import des types nécessaires
import type { AuthenticatedUser, UserContextType } from '../types'

// Déclaration de type pour l'augmentation de l'objet global
declare global {
  interface Window {
    redirectTo: string | null
  }
}

// Mock du composant Navigate pour pouvoir vérifier la redirection
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      // On stocke la destination dans une variable globale pour pouvoir la vérifier
      vi.stubGlobal('redirectTo', to)
      return null
    },
  }
})

describe('SimpleProtectedRoute Component', () => {
  // Réinitialiser la destination de redirection avant chaque test
  beforeEach(() => {
    vi.stubGlobal('redirectTo', null)
  })

  // Nettoyage après chaque test
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Composant enfant à utiliser pour les tests
  const TestChild = () => <div data-testid="test-child">Protected Content</div>

  // Création d'un mock pour le contexte utilisateur
  const createMockUserContext = (
    user?: AuthenticatedUser
  ): UserContextType => ({
    authenticatedUser: user,
    authsMe: vi.fn(),
    registerUser: vi.fn(),
    registerManager: vi.fn(),
    registerProducer: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    changePassword: vi.fn(),
  })

  // Test pour un utilisateur non authentifié
  test('redirects to login page for unauthenticated user', () => {
    render(
      <UserContext.Provider value={createMockUserContext(undefined)}>
        <MemoryRouter>
          <SimpleProtectedRoute>
            <TestChild />
          </SimpleProtectedRoute>
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Vérifier la redirection vers la page de connexion
    expect(window.redirectTo).toBe('/login')
    // Le composant enfant ne devrait pas être rendu
    expect(screen.queryByTestId('test-child')).toBeNull()
  })

  // Test pour un utilisateur authentifié sans restriction de rôle
  test('renders children for authenticated user without role requirement', () => {
    const user: AuthenticatedUser = {
      role: 'Client',
      name: 'Test User',
      email: 'user@example.com',
      firstname: 'Test',
      token: 'token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(user)}>
        <MemoryRouter>
          <SimpleProtectedRoute>
            <TestChild />
          </SimpleProtectedRoute>
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Le composant enfant devrait être rendu
    expect(screen.getByTestId('test-child')).toBeTruthy()
    // Aucune redirection ne devrait avoir lieu
    expect(window.redirectTo).toBe(null)
  })

  // Test pour un utilisateur avec le rôle requis (string unique)
  test('renders children for authenticated user with required role (string)', () => {
    const managerUser: AuthenticatedUser = {
      role: 'Manager',
      name: 'Manager User',
      email: 'manager@example.com',
      firstname: 'Manager',
      token: 'manager-token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(managerUser)}>
        <MemoryRouter>
          <SimpleProtectedRoute requiredRole="Manager">
            <TestChild />
          </SimpleProtectedRoute>
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Le composant enfant devrait être rendu
    expect(screen.getByTestId('test-child')).toBeTruthy()
    // Aucune redirection ne devrait avoir lieu
    expect(window.redirectTo).toBe(null)
  })

  // Test pour un utilisateur avec un des rôles requis (tableau de strings)
  test('renders children for authenticated user with one of required roles (array)', () => {
    const producerUser: AuthenticatedUser = {
      role: 'Producer',
      name: 'Producer User',
      email: 'producer@example.com',
      firstname: 'Producer',
      token: 'producer-token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(producerUser)}>
        <MemoryRouter>
          <SimpleProtectedRoute requiredRole={['Manager', 'Producer']}>
            <TestChild />
          </SimpleProtectedRoute>
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Le composant enfant devrait être rendu
    expect(screen.getByTestId('test-child')).toBeTruthy()
    // Aucune redirection ne devrait avoir lieu
    expect(window.redirectTo).toBe(null)
  })

  // Test pour un utilisateur sans le rôle requis
  test('redirects to home page for authenticated user without required role', () => {
    const clientUser: AuthenticatedUser = {
      role: 'Client',
      name: 'Client User',
      email: 'client@example.com',
      firstname: 'Client',
      token: 'client-token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(clientUser)}>
        <MemoryRouter>
          <SimpleProtectedRoute requiredRole="Manager">
            <TestChild />
          </SimpleProtectedRoute>
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Vérifier la redirection vers la page d'accueil
    expect(window.redirectTo).toBe('/')
    // Le composant enfant ne devrait pas être rendu
    expect(screen.queryByTestId('test-child')).toBeNull()
  })

  // Test pour un utilisateur sans aucun des rôles requis (tableau)
  test('redirects to home page for authenticated user without any of required roles (array)', () => {
    const volunteerUser: AuthenticatedUser = {
      role: 'Volunteer',
      name: 'Volunteer User',
      email: 'benevole@exemple.com',
      firstname: 'Volunteer',
      token: 'volunteer-token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(volunteerUser)}>
        <MemoryRouter>
          <SimpleProtectedRoute requiredRole={['Manager', 'Producer']}>
            <TestChild />
          </SimpleProtectedRoute>
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Vérifier la redirection vers la page d'accueil
    expect(window.redirectTo).toBe('/')
    // Le composant enfant ne devrait pas être rendu
    expect(screen.queryByTestId('test-child')).toBeNull()
  })
})
