import { render, screen } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { UserContext } from '../../contexts/UserContext'

// Mock the dependencies
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

// Import the App component after all mocks are defined
import App from './index'

describe('App Component', () => {
  const authsMeMock = vi.fn()

  // Setup and teardown
  beforeEach(() => {
    vi.resetAllMocks()
    // Clear document.cookie more thoroughly by setting expired cookies
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=')
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
    })
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
    // Set a mock token in document.cookie
    document.cookie = 'token=fake-token; path=/; max-age=3600'

    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
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
    // Make sure cookies are empty - more thorough approach
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=')
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
    })

    // Verify cookie is empty
    expect(document.cookie).toBe('')

    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
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

  // Replace the style test with a structure test
  test('has proper layout structure', () => {
    const mockUserContext = {
      authenticatedUser: undefined,
      authsMe: authsMeMock,
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
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
