import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext'
import IndexRoute from './IndexRoute'

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

// Mock des composants de page
vi.mock('../components/pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}))

describe('IndexRoute Component', () => {
  // Réinitialiser la destination de redirection avant chaque test
  beforeEach(() => {
    vi.stubGlobal('redirectTo', null)
  })

  // Nettoyage après chaque test
  afterEach(() => {
    vi.unstubAllGlobals()
  })

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
  test('renders HomePage for unauthenticated user', () => {
    render(
      <UserContext.Provider value={createMockUserContext(undefined)}>
        <MemoryRouter>
          <IndexRoute />
        </MemoryRouter>
      </UserContext.Provider>
    )

    // La HomePage devrait être rendue pour les utilisateurs non authentifiés
    expect(screen.getByTestId('home-page')).toBeTruthy()
    // Aucune redirection ne devrait avoir lieu
    expect(window.redirectTo).toBe(null)
  })

  // Test pour un utilisateur avec le rôle "Client"
  test('renders HomePage for authenticated user with Client role', () => {
    const clientUser: AuthenticatedUser = {
      role: 'Client',
      name: 'Test User',
      email: 'client@example.com',
      firstname: 'Test',
      token: 'client-token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(clientUser)}>
        <MemoryRouter>
          <IndexRoute />
        </MemoryRouter>
      </UserContext.Provider>
    )

    // La HomePage devrait être rendue pour les utilisateurs avec le rôle Client
    expect(screen.getByTestId('home-page')).toBeTruthy()
    // Aucune redirection ne devrait avoir lieu
    expect(window.redirectTo).toBe(null)
  })

  // Test pour un utilisateur avec le rôle "Producer"
  test('redirects to producer dashboard for authenticated user with Producer role', () => {
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
          <IndexRoute />
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Vérifier que la redirection a lieu vers /producer-dashboard
    expect(window.redirectTo).toBe('/producer-dashboard')
  })

  // Test pour un utilisateur avec le rôle "Manager"
  test('redirects to manager dashboard for authenticated user with Manager role', () => {
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
          <IndexRoute />
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Vérifier que la redirection a lieu vers /manager-dashboard
    expect(window.redirectTo).toBe('/manager-dashboard')
  })

  // Test pour un utilisateur avec le rôle "Volunteer"
  test('redirects to volunteer page for authenticated user with Volunteer role', () => {
    const volunteerUser: AuthenticatedUser = {
      role: 'Volunteer',
      name: 'Volunteer User',
      email: 'volunteer@example.com',
      firstname: 'Volunteer',
      token: 'volunteer-token-123',
    }

    render(
      <UserContext.Provider value={createMockUserContext(volunteerUser)}>
        <MemoryRouter>
          <IndexRoute />
        </MemoryRouter>
      </UserContext.Provider>
    )

    // Vérifier que la redirection a lieu vers /volunteer
    expect(window.redirectTo).toBe('/volunteer')
  })

  // Test pour un utilisateur avec un rôle inconnu (comportement par défaut)
  test('renders HomePage for authenticated user with unknown role (default case)', () => {
    // Utilisation d'un casting pour permettre un rôle qui n'est pas dans l'enum
    const unknownRoleUser = {
      role: 'UnknownRole',
      name: 'Unknown Role User',
      email: 'unknown@example.com',
      firstname: 'Unknown',
      token: 'unknown-token-123',
    } as unknown as AuthenticatedUser

    render(
      <UserContext.Provider value={createMockUserContext(unknownRoleUser)}>
        <MemoryRouter>
          <IndexRoute />
        </MemoryRouter>
      </UserContext.Provider>
    )

    // La HomePage devrait être rendue pour les utilisateurs avec un rôle inconnu
    expect(screen.getByTestId('home-page')).toBeTruthy()
    // Aucune redirection ne devrait avoir lieu
    expect(window.redirectTo).toBe(null)
  })
})
