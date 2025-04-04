import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ProducerRegisterPage from '../../components/pages/ProducerRegisterPage'
import { UserContext } from '../../contexts/UserContext'

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('ProducerRegisterPage', () => {
  // Setup common test variables
  const registerProducerMock = vi.fn()
  const navigateMock = vi.fn()

  // Setup default mock context
  const mockContextValue = {
    authenticatedUser: undefined,
    authsMe: vi.fn(),
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
    registerManager: vi.fn(),
    registerProducer: registerProducerMock,
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
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Check for all input fields
    expect(screen.getByTestId('name-input')).toBeTruthy()
    expect(screen.getByTestId('firstname-input')).toBeTruthy()
    expect(screen.getByTestId('company-input')).toBeTruthy()
    expect(screen.getByTestId('street-input')).toBeTruthy()
    expect(screen.getByTestId('number-input')).toBeTruthy()
    expect(screen.getByTestId('box-input')).toBeTruthy()
    expect(screen.getByTestId('postalCode-input')).toBeTruthy()
    expect(screen.getByTestId('city-input')).toBeTruthy()
    expect(screen.getByTestId('country-input')).toBeTruthy()
    expect(screen.getByTestId('phoneNumber-input')).toBeTruthy()
    expect(screen.getByTestId('email-input')).toBeTruthy()
    expect(screen.getByTestId('password-input')).toBeTruthy()
    expect(screen.getByTestId('confirm-password-input')).toBeTruthy()
    expect(screen.getByTestId('submit-button')).toBeTruthy()
  })

  test('displays error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get input elements
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const companyInput = screen
      .getByTestId('company-input')
      .querySelector('input')
    const streetInput = screen
      .getByTestId('street-input')
      .querySelector('input')
    const numberInput = screen
      .getByTestId('number-input')
      .querySelector('input')
    const postalCodeInput = screen
      .getByTestId('postalCode-input')
      .querySelector('input')
    const cityInput = screen.getByTestId('city-input').querySelector('input')
    const countryInput = screen
      .getByTestId('country-input')
      .querySelector('input')
    const phoneNumberInput = screen
      .getByTestId('phoneNumber-input')
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
      companyInput &&
      streetInput &&
      numberInput &&
      postalCodeInput &&
      cityInput &&
      countryInput &&
      phoneNumberInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      // Fill in form with different passwords
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(companyInput, { target: { value: 'Test Company' } })
      fireEvent.change(streetInput, { target: { value: 'Test Street' } })
      fireEvent.change(numberInput, { target: { value: '123' } })
      fireEvent.change(postalCodeInput, { target: { value: '12345' } })
      fireEvent.change(cityInput, { target: { value: 'Test City' } })
      fireEvent.change(countryInput, { target: { value: 'Test Country' } })
      fireEvent.change(phoneNumberInput, { target: { value: '0123456789' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'DifferentPassword123!' },
      })

      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Verify registerProducer was not called and navigation did not occur
      expect(registerProducerMock).not.toHaveBeenCalled()
      expect(navigateMock).not.toHaveBeenCalled()

      // Check for password mismatch error message
      await waitFor(
        () => {
          const errorMessages = screen.getAllByText((content) =>
            content.includes('Les mots de passe ne correspondent pas')
          )
          expect(errorMessages.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )
    } else {
      throw new Error('One or more input fields were not found correctly')
    }
  })

  test('displays error for invalid email format', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get email input and fill with invalid format
    const emailInput = screen.getByTestId('email-input').querySelector('input')
    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

      // Fill other required fields
      const nameInput = screen.getByTestId('name-input').querySelector('input')
      const firstnameInput = screen
        .getByTestId('firstname-input')
        .querySelector('input')
      const companyInput = screen
        .getByTestId('company-input')
        .querySelector('input')
      const streetInput = screen
        .getByTestId('street-input')
        .querySelector('input')
      const numberInput = screen
        .getByTestId('number-input')
        .querySelector('input')
      const postalCodeInput = screen
        .getByTestId('postalCode-input')
        .querySelector('input')
      const cityInput = screen.getByTestId('city-input').querySelector('input')
      const phoneNumberInput = screen
        .getByTestId('phoneNumber-input')
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
        companyInput &&
        streetInput &&
        numberInput &&
        postalCodeInput &&
        cityInput &&
        phoneNumberInput &&
        passwordInput &&
        confirmPasswordInput
      ) {
        fireEvent.change(nameInput, { target: { value: 'Doe' } })
        fireEvent.change(firstnameInput, { target: { value: 'John' } })
        fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        fireEvent.change(streetInput, { target: { value: 'Test Street' } })
        fireEvent.change(numberInput, { target: { value: '123' } })
        fireEvent.change(postalCodeInput, { target: { value: '12345' } })
        fireEvent.change(cityInput, { target: { value: 'Test City' } })
        fireEvent.change(phoneNumberInput, { target: { value: '0123456789' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'Password123!' },
        })

        // Submit form
        const submitButton = screen.getByTestId('submit-button')
        fireEvent.click(submitButton)

        // Check for email format error
        await waitFor(
          () => {
            const errorMessages = screen.getAllByText((content) =>
              content.includes("Format d'email invalide")
            )
            expect(errorMessages.length).toBeGreaterThan(0)
          },
          { timeout: 1000 }
        )

        // Verify registerProducer was not called
        expect(registerProducerMock).not.toHaveBeenCalled()
      }
    }
  })

  test('displays error for invalid phone number format', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get phone input and fill with invalid format
    const phoneNumberInput = screen
      .getByTestId('phoneNumber-input')
      .querySelector('input')
    if (phoneNumberInput) {
      fireEvent.change(phoneNumberInput, { target: { value: 'abc123' } })

      // Fill other required fields with valid data
      const nameInput = screen.getByTestId('name-input').querySelector('input')
      const firstnameInput = screen
        .getByTestId('firstname-input')
        .querySelector('input')
      const companyInput = screen
        .getByTestId('company-input')
        .querySelector('input')
      const streetInput = screen
        .getByTestId('street-input')
        .querySelector('input')
      const numberInput = screen
        .getByTestId('number-input')
        .querySelector('input')
      const postalCodeInput = screen
        .getByTestId('postalCode-input')
        .querySelector('input')
      const cityInput = screen.getByTestId('city-input').querySelector('input')
      const emailInput = screen
        .getByTestId('email-input')
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
        companyInput &&
        streetInput &&
        numberInput &&
        postalCodeInput &&
        cityInput &&
        emailInput &&
        passwordInput &&
        confirmPasswordInput
      ) {
        fireEvent.change(nameInput, { target: { value: 'Doe' } })
        fireEvent.change(firstnameInput, { target: { value: 'John' } })
        fireEvent.change(companyInput, { target: { value: 'Test Company' } })
        fireEvent.change(streetInput, { target: { value: 'Test Street' } })
        fireEvent.change(numberInput, { target: { value: '123' } })
        fireEvent.change(postalCodeInput, { target: { value: '12345' } })
        fireEvent.change(cityInput, { target: { value: 'Test City' } })
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
        fireEvent.change(confirmPasswordInput, {
          target: { value: 'Password123!' },
        })

        // Submit form
        const submitButton = screen.getByTestId('submit-button')
        fireEvent.click(submitButton)

        // Check for phone number format error
        await waitFor(
          () => {
            const errorMessages = screen.getAllByText((content) =>
              content.includes('Le numéro de téléphone doit commencer par')
            )
            expect(errorMessages.length).toBeGreaterThan(0)
          },
          { timeout: 1000 }
        )

        // Verify registerProducer was not called
        expect(registerProducerMock).not.toHaveBeenCalled()
      }
    }
  })

  test('displays error for weak password', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with weak password
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const companyInput = screen
      .getByTestId('company-input')
      .querySelector('input')
    const streetInput = screen
      .getByTestId('street-input')
      .querySelector('input')
    const numberInput = screen
      .getByTestId('number-input')
      .querySelector('input')
    const postalCodeInput = screen
      .getByTestId('postalCode-input')
      .querySelector('input')
    const cityInput = screen.getByTestId('city-input').querySelector('input')
    const phoneNumberInput = screen
      .getByTestId('phoneNumber-input')
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
      companyInput &&
      streetInput &&
      numberInput &&
      postalCodeInput &&
      cityInput &&
      phoneNumberInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(companyInput, { target: { value: 'Test Company' } })
      fireEvent.change(streetInput, { target: { value: 'Test Street' } })
      fireEvent.change(numberInput, { target: { value: '123' } })
      fireEvent.change(postalCodeInput, { target: { value: '12345' } })
      fireEvent.change(cityInput, { target: { value: 'Test City' } })
      fireEvent.change(phoneNumberInput, { target: { value: '0123456789' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'weakpass' } }) // Weak password without required characters
      fireEvent.change(confirmPasswordInput, { target: { value: 'weakpass' } })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Check for weak password error
      await waitFor(
        () => {
          const errorMessages = screen.getAllByText((content) =>
            content.includes(
              'Le mot de passe doit contenir au moins 8 caractères'
            )
          )
          expect(errorMessages.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )

      // Verify registerProducer was not called
      expect(registerProducerMock).not.toHaveBeenCalled()
    }
  })

  test('displays error for non-numeric house number', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with non-numeric house number
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const companyInput = screen
      .getByTestId('company-input')
      .querySelector('input')
    const streetInput = screen
      .getByTestId('street-input')
      .querySelector('input')
    const numberInput = screen
      .getByTestId('number-input')
      .querySelector('input')
    const postalCodeInput = screen
      .getByTestId('postalCode-input')
      .querySelector('input')
    const cityInput = screen.getByTestId('city-input').querySelector('input')
    const phoneNumberInput = screen
      .getByTestId('phoneNumber-input')
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
      companyInput &&
      streetInput &&
      numberInput &&
      postalCodeInput &&
      cityInput &&
      phoneNumberInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(companyInput, { target: { value: 'Test Company' } })
      fireEvent.change(streetInput, { target: { value: 'Test Street' } })
      fireEvent.change(numberInput, { target: { value: '123A' } }) // Non-numeric house number
      fireEvent.change(postalCodeInput, { target: { value: '12345' } })
      fireEvent.change(cityInput, { target: { value: 'Test City' } })
      fireEvent.change(phoneNumberInput, { target: { value: '0123456789' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Check for non-numeric house number error
      await waitFor(
        () => {
          const errorMessages = screen.getAllByText((content) =>
            content.includes('Le numéro doit contenir uniquement des chiffres')
          )
          expect(errorMessages.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )

      // Verify registerProducer was not called
      expect(registerProducerMock).not.toHaveBeenCalled()
    }
  })

  test('displays error for missing required fields', async () => {
    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Submit form without filling any fields
    const submitButton = screen.getByTestId('submit-button')
    fireEvent.click(submitButton)

    // Check for error message about required fields
    await waitFor(
      () => {
        const errorMessages = screen.getAllByText((content) =>
          content.includes('Veuillez remplir tous les champs obligatoires')
        )
        expect(errorMessages.length).toBeGreaterThan(0)
      },
      { timeout: 1000 }
    )

    // Verify registerProducer was not called
    expect(registerProducerMock).not.toHaveBeenCalled()
  })

  test('successfully submits form with valid data', async () => {
    // Do NOT use fake timers in this test as it interferes with waitFor

    // Mock successful registration
    registerProducerMock.mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with valid data
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const companyInput = screen
      .getByTestId('company-input')
      .querySelector('input')
    const streetInput = screen
      .getByTestId('street-input')
      .querySelector('input')
    const numberInput = screen
      .getByTestId('number-input')
      .querySelector('input')
    const postalCodeInput = screen
      .getByTestId('postalCode-input')
      .querySelector('input')
    const cityInput = screen.getByTestId('city-input').querySelector('input')
    const phoneNumberInput = screen
      .getByTestId('phoneNumber-input')
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
      companyInput &&
      streetInput &&
      numberInput &&
      postalCodeInput &&
      cityInput &&
      phoneNumberInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(companyInput, { target: { value: 'Test Company' } })
      fireEvent.change(streetInput, { target: { value: 'Test Street' } })
      fireEvent.change(numberInput, { target: { value: '123' } })
      fireEvent.change(postalCodeInput, { target: { value: '12345' } })
      fireEvent.change(cityInput, { target: { value: 'Test City' } })
      fireEvent.change(phoneNumberInput, { target: { value: '0123456789' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Verify registerProducer was called with correct data
      await waitFor(
        () => {
          expect(registerProducerMock).toHaveBeenCalledWith({
            name: 'Doe',
            firstname: 'John',
            company: 'Test Company',
            street: 'Test Street',
            number: '123',
            box: '',
            postalCode: '12345',
            city: 'Test City',
            country: 'Belgique',
            phoneNumber: '0123456789',
            email: 'test@example.com',
            password: 'Password123!',
          })
        },
        { timeout: 1000 }
      )

      // Check for success message
      await waitFor(
        () => {
          const successMessages = screen.getAllByText((content) =>
            content.includes('Inscription réussie')
          )
          expect(successMessages.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )

      // After successful registration, should show CircularProgress
      expect(screen.getByRole('progressbar')).toBeTruthy()

      // Verify the success message is shown
      await waitFor(
        () => {
          const successMessages = screen.getAllByText((content) =>
            content.includes('Le compte producteur a été créé avec succès')
          )
          expect(successMessages.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )
    }
  })

  test('handles API error during registration', async () => {
    // Reset mocks before this test
    vi.clearAllMocks()

    // Mock registration failure
    const errorMessage = 'Registration failed'
    registerProducerMock.mockRejectedValue(new Error(errorMessage))

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProducerRegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Fill form with valid data
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const companyInput = screen
      .getByTestId('company-input')
      .querySelector('input')
    const streetInput = screen
      .getByTestId('street-input')
      .querySelector('input')
    const numberInput = screen
      .getByTestId('number-input')
      .querySelector('input')
    const postalCodeInput = screen
      .getByTestId('postalCode-input')
      .querySelector('input')
    const cityInput = screen.getByTestId('city-input').querySelector('input')
    const phoneNumberInput = screen
      .getByTestId('phoneNumber-input')
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
      companyInput &&
      streetInput &&
      numberInput &&
      postalCodeInput &&
      cityInput &&
      phoneNumberInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
      fireEvent.change(nameInput, { target: { value: 'Doe' } })
      fireEvent.change(firstnameInput, { target: { value: 'John' } })
      fireEvent.change(companyInput, { target: { value: 'Test Company' } })
      fireEvent.change(streetInput, { target: { value: 'Test Street' } })
      fireEvent.change(numberInput, { target: { value: '123' } })
      fireEvent.change(postalCodeInput, { target: { value: '12345' } })
      fireEvent.change(cityInput, { target: { value: 'Test City' } })
      fireEvent.change(phoneNumberInput, { target: { value: '0123456789' } })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123!' },
      })

      // Submit form
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Wait for registerProducer to be called
      await waitFor(
        () => {
          expect(registerProducerMock).toHaveBeenCalled()
        },
        { timeout: 1000 }
      )

      // Error message should be displayed
      await waitFor(
        () => {
          const errorMessages = screen.getAllByText((content) =>
            content.includes('Cette adresse email est déjà utilisée')
          )
          expect(errorMessages.length).toBeGreaterThan(0)
        },
        { timeout: 1000 }
      )

      // Navigation should not have occurred
      expect(navigateMock).not.toHaveBeenCalled()
    }
  })
})
