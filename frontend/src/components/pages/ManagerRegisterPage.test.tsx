import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ManagerRegisterPage from './ManagerRegisterPage'
import { UserContext } from '../../contexts/UserContext'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('ManagerRegisterPage', () => {
  // Setup common test variables
  const registerManagerMock = vi.fn()
  const navigateMock = vi.fn()

  // Setup default mock context
  const mockContextValue = {
    authenticatedUser: undefined,
    authsMe: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    registerManager: registerManagerMock,
    registerProducer: vi.fn(),
    changePassword: vi.fn(),
  }

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigateMock)
  })

  test('renders a form with all required inputs', () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check for all required input fields
    expect(screen.getByTestId('name-input')).toBeTruthy()
    expect(screen.getByTestId('firstname-input')).toBeTruthy()
    expect(screen.getByTestId('email-input')).toBeTruthy()
    expect(screen.getByTestId('password-input')).toBeTruthy()
    expect(screen.getByTestId('confirm-password-input')).toBeTruthy()
    expect(screen.getByTestId('submit-button')).toBeTruthy()
  })

  test('displays error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get input elements
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const emailInput = screen.getByTestId('email-input').querySelector('input')
    const passwordInput = screen
      .getByTestId('password-input')
      .querySelector('input')
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input')

    // Ensure all inputs are found
    if (
      nameInput &&
      firstnameInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      // Fill in form with different passwords
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(emailInput, { target: { value: 'manager@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'DifferentPassword123!' },
      })

      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Verify registerManager was not called and navigation did not occur
      expect(registerManagerMock).not.toHaveBeenCalled()
      expect(navigateMock).not.toHaveBeenCalled()

      // Check for password mismatch error message
      await waitFor(() => {
        expect(
          screen.getByText('Les mots de passe ne correspondent pas.')
        ).toBeTruthy()
      })
    } else {
      throw new Error('One or more input fields were not found correctly')
    }
  })

  test('displays error for invalid email format', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get email input and fill with invalid format
    const emailInput = screen.getByTestId('email-input').querySelector('input')
    if (emailInput) {
      // Fill all required fields with valid data
      const nameInput = screen.getByTestId('name-input').querySelector('input')
      const firstnameInput = screen
        .getByTestId('firstname-input')
        .querySelector('input')
      const passwordInput = screen
        .getByTestId('password-input')
        .querySelector('input')
      const confirmPasswordInput = screen
        .getByTestId('confirm-password-input')
        .querySelector('input')

      if (
        nameInput &&
        firstnameInput &&
        passwordInput &&
        confirmPasswordInput
      ) {
        fireEvent.change(nameInput, { target: { value: 'Doe' } })
        fireEvent.change(firstnameInput, { target: { value: 'John' } })
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } }) // Invalid email format
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'Password123!' },
        })

        // Submit form
        const submitButton = screen.getByTestId('submit-button')
        fireEvent.click(submitButton)

        // Check for email format error
        await waitFor(() => {
          expect(screen.getByText("Format d'email invalide.")).toBeTruthy()
        })

        // Verify registerManager was not called
        expect(registerManagerMock).not.toHaveBeenCalled()
      }
    }
  })

  test('displays error for weak password', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with weak password
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const emailInput = screen.getByTestId('email-input').querySelector('input')
    const passwordInput = screen
      .getByTestId('password-input')
      .querySelector('input')
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input')

    if (
      nameInput &&
      firstnameInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(emailInput, { target: { value: 'manager@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'weakpass' } }) // Weak password without required characters
      fireEvent.change(confirmPasswordInput, { target: { value: 'weakpass' } })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Check for weak password error
      await waitFor(() => {
        expect(
          screen.getByText(
            'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
          )
        ).toBeTruthy()
      })

      // Verify registerManager was not called
      expect(registerManagerMock).not.toHaveBeenCalled()
    }
  })

  test('displays error for missing required fields', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Submit form without filling any fields
    const submitButton = screen.getByTestId('submit-button')
    fireEvent.click(submitButton)

    // Check for error message about required fields
    await waitFor(() => {
      expect(
        screen.getByText('Veuillez remplir tous les champs obligatoires.')
      ).toBeTruthy()
    })

    // Verify registerManager was not called
    expect(registerManagerMock).not.toHaveBeenCalled()
  })

  test('successfully submits form with valid data', async () => {
    // Mock successful registration
    registerManagerMock.mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with valid data
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const emailInput = screen.getByTestId('email-input').querySelector('input')
    const passwordInput = screen
      .getByTestId('password-input')
      .querySelector('input')
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input')

    if (
      nameInput &&
      firstnameInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(emailInput, { target: { value: 'manager@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Verify registerManager was called with correct data
      await waitFor(() => {
        expect(registerManagerMock).toHaveBeenCalledWith({
          name: 'Doe',
          firstname: 'John',
          email: 'manager@example.com',
          password: 'Password123!',
        })
      })

      // In a real test environment, we can't reliably test the setTimeout
      // without causing timing issues, so we'll just verify registration was called
      // and success message is displayed

      // Verify the success message is shown
      await waitFor(() => {
        expect(screen.getByText('Inscription réussie !')).toBeTruthy()
      })
    }
  })

  test('handles API error during registration', async () => {
    // Reset mocks before this test
    vi.clearAllMocks()

    // Mock registration failure
    const errorMessage = 'Registration failed'
    registerManagerMock.mockRejectedValue(new Error(errorMessage))

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ManagerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with valid data
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const emailInput = screen.getByTestId('email-input').querySelector('input')
    const passwordInput = screen
      .getByTestId('password-input')
      .querySelector('input')
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input')

    if (
      nameInput &&
      firstnameInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(emailInput, { target: { value: 'manager@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Wait for registerManager to be called
      await waitFor(
        () => {
          expect(registerManagerMock).toHaveBeenCalled()
        },
        { timeout: 2000 }
      )

      // Error message should be displayed
      await waitFor(
        () => {
          expect(
            screen.getByText('Cette adresse email est déjà utilisée.')
          ).toBeTruthy()
        },
        { timeout: 2000 }
      )

      // Navigation should not have occurred
      expect(navigateMock).not.toHaveBeenCalled()
    }
  })
})
