import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'

// Mock modules
vi.mock('../Header', () => ({
  default: ({ title }: { title: string }) => (
    <header data-testid="mock-header">{title}</header>
  ),
}))

vi.mock('../Footer', () => ({
  default: () => <footer data-testid="mock-footer">Mock Footer</footer>,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Mock Outlet Content</div>,
  }
})

// Mock the session utility
vi.mock('../../utils/session', () => ({
  getAuthenticatedUser: vi.fn(() => undefined),
  clearAuthenticatedUser: vi.fn(),
}))

// Import the mocked session utils for direct manipulation
import { getAuthenticatedUser } from '../../utils/session'

// Import the App component after all mocks are defined
import App from './index'

describe('App Component', () => {
  const authsMeMock = vi.fn()

  // Setup and teardown
  beforeEach(() => {
    vi.resetAllMocks()
    // Reset mock implementations
    vi.mocked(getAuthenticatedUser).mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders without crashing', () => {
    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <App />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check if all main components are rendered
    expect(screen.getByTestId('mock-header')).toBeDefined()
    expect(screen.getByTestId('mock-outlet')).toBeDefined()
    expect(screen.getByTestId('mock-footer')).toBeDefined()
  })

  test('displays the correct header title', () => {
    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <App />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check the header title
    expect(screen.getByText('Terroir & Cie')).toBeDefined()
  })

  test('calls authsMe when token exists in cookies', () => {
    // Mock getAuthenticatedUser to return a user with token
    vi.mocked(getAuthenticatedUser).mockReturnValue({
      email: 'test@example.com',
      name: 'Test',
      firstname: 'User',
      token: 'fake-token',
      role: 'client',
    })

    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <App />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check if authsMe was called with the token
    expect(authsMeMock).toHaveBeenCalledWith('fake-token')
  })

  test('does not call authsMe when no token exists', () => {
    // Ensure getAuthenticatedUser returns undefined
    vi.mocked(getAuthenticatedUser).mockReturnValue(undefined)

    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <App />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check that authsMe was not called
    expect(authsMeMock).not.toHaveBeenCalled()
  })

  test('has proper layout structure', () => {
    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockUserContext}>
          <App />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check for the main structural components
    const headerElement = screen.getByTestId('mock-header')
    const contentElement = screen.getByTestId('mock-outlet')
    const footerElement = screen.getByTestId('mock-footer')

    // Verify all components are present
    expect(headerElement).toBeDefined()
    expect(contentElement).toBeDefined()
    expect(footerElement).toBeDefined()

    // Just check they're in the document in the correct order
    const html = document.body.innerHTML
    const headerIndex = html.indexOf('mock-header')
    const contentIndex = html.indexOf('mock-outlet')
    const footerIndex = html.indexOf('mock-footer')

    expect(headerIndex).toBeGreaterThan(-1)
    expect(contentIndex).toBeGreaterThan(headerIndex)
    expect(footerIndex).toBeGreaterThan(contentIndex)
  })
})
