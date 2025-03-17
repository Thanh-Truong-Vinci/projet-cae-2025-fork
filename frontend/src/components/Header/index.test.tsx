import { render, screen } from '@testing-library/react'
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
})
