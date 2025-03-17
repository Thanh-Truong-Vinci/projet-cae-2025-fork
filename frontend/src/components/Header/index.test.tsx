import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import Header from './index'
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

describe('Header', () => {
  const navigateMock = vi.fn()

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()
    vi.mocked(router.useNavigate).mockReturnValue(navigateMock)
  })

  test('renders with the correct title', () => {
    const testTitle = 'Test Title'

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
          <Header title={testTitle} />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check for title text
    const titleElement = screen.getByText(testTitle)
    expect(titleElement).toBeDefined()
  })

  test('navigates to home when title is clicked', () => {
    const testTitle = 'Click Me'

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
          <Header title={testTitle} />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Find and click the title
    const titleElement = screen.getByText(testTitle)
    fireEvent.click(titleElement)

    // Check that navigation was called with '/'
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  test('renders the NavBar component', () => {
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
          <Header title="Test" />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check for the NavBar component
    const navbar = screen.getByTestId('navbar-component')
    expect(navbar).toBeDefined()
  })
})
