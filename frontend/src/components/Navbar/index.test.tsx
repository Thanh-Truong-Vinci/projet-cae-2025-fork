import { render, screen, fireEvent } from '@testing-library/react'
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
    const registerButton = screen.getByText(/Inscription/i)
    const loginButton = screen.getByText(/Connexion/i)

    expect(registerButton).toBeDefined()
    expect(loginButton).toBeDefined()

    // Check that the logout button is not in the document
    const logoutButton = screen.queryByText(/Se déconnecter/i)
    expect(logoutButton).toBeNull()
  })

  test('renders logout button when user is authenticated', () => {
    const mockContextValue = {
      authenticatedUser: {
        email: 'test@example.com',
        name: 'TestName',
        firstname: 'TestFirstname',
        token: 'fake-token',
        // Add other required fields for authenticatedUser
      },
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

    // Check that the logout button is in the document
    const logoutButton = screen.getByText(/Se déconnecter/i)
    expect(logoutButton).toBeDefined()

    // Check that the login and register buttons are not in the document
    const registerButton = screen.queryByText(/Inscription/i)
    const loginButton = screen.queryByText(/Connexion/i)

    expect(registerButton).toBeNull()
    expect(loginButton).toBeNull()
  })
  test('navigates to /register when register button is clicked', () => {
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

    const registerButton = screen.getByText(/Inscription/i)

    expect(registerButton).toBeDefined()

    fireEvent.click(registerButton)

    expect(navigateMock).toHaveBeenCalledWith('/register')
  })

  test('navigates to /login when login button is clicked', () => {
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

    const loginButton = screen.getByText(/Connexion/i)
    fireEvent.click(loginButton)

    expect(navigateMock).toHaveBeenCalledWith('/login')
  })

  test('calls handleLogout when logout button is clicked', () => {
    // Mock document.cookie
    const documentCookieSpy = vi.spyOn(document, 'cookie', 'set')

    const clearUserMock = vi.fn()
    const mockContextValue = {
      authenticatedUser: {
        email: 'test@example.com',
        name: 'TestName',
        firstname: 'TestFirstname',
        token: 'fake-token',
        // Add other required fields for authenticatedUser
      },
      authsMe: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: clearUserMock,
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <NavBar />
        </UserContext.Provider>
      </MemoryRouter>
    )

    const logoutButton = screen.getByText(/Se déconnecter/i)
    fireEvent.click(logoutButton)

    // Check that document.cookie was set to expire the token
    expect(documentCookieSpy).toHaveBeenCalledWith('token=; path=/; max-age=-1')

    // Check that clearUser was called
    expect(clearUserMock).toHaveBeenCalled()
  })
})
