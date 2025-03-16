import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import NavBar from './index'
import { UserContext } from '../../contexts/UserContext'
import * as router from 'react-router-dom'

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('NavBar', () => {
  const navigateMock = vi.fn()

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
  })

  test('renders login and register buttons when user is not authenticated', () => {
    const mockContextValue = {
      authenticatedUser: undefined,
      authsMe: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NavBar />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check that the login and register buttons are in the document
    const registerButton = screen.getByText(/S'inscrire/i)
    const loginButton = screen.getByText(/Se connecter/i)

    expect(registerButton).toBeDefined()
    expect(loginButton).toBeDefined()

    // Check that the logout button is not in the document
    const logoutButton = screen.queryByText(/Se déconnecter/i)
    expect(logoutButton).toBeNull()
  })
})
