import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { describe, test, expect, vi } from 'vitest'
import RegisterPage from '../../components/pages/RegisterPage'
import { UserContext } from '../../contexts/UserContext'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

describe('RegisterPage', () => {
  test('renders a form with all required inputs', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )
    const nameInput = screen.getByTestId('name-input')
    const firstnameInput = screen.getByTestId('firstname-input')
    const streetInput = screen.getByTestId('street-input')
    const numberInput = screen.getByTestId('number-input')
    const boxInput = screen.getByTestId('box-input')
    const postalCodeInput = screen.getByTestId('postalCode-input')
    const cityInput = screen.getByTestId('city-input')
    const countryInput = screen.getByTestId('country-input')
    const phoneNumberInput = screen.getByTestId('phoneNumber-input')
    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const confirmPasswordInput = screen.getByTestId('confirmPassword-input')

    expect(nameInput).toBeTruthy()
    expect(firstnameInput).toBeTruthy()
    expect(streetInput).toBeTruthy()
    expect(numberInput).toBeTruthy()
    expect(boxInput).toBeTruthy()
    expect(postalCodeInput).toBeTruthy()
    expect(cityInput).toBeTruthy()
    expect(countryInput).toBeTruthy()
    expect(phoneNumberInput).toBeTruthy()
    expect(emailInput).toBeTruthy()
    expect(passwordInput).toBeTruthy()
    expect(confirmPasswordInput).toBeTruthy()
  })

  test('calls registerUser and navigates to LoginPage when the form is submitted', async () => {
    const registerUserMock = vi.fn()
    const navigateMock = vi.fn()
    const mockContextValue = {
      authenticatedUser: undefined,
      authsMe: vi.fn(),
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
    }

    vi.mocked(useNavigate).mockReturnValue(navigateMock)

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get the input element inside each TextField
    const nameInput = screen.getByLabelText(/Name/)
    const firstnameInput = screen.getByLabelText(/First name/)
    const streetInput = screen.getByLabelText(/Street/)
    const numberInput = screen.getByLabelText(/Number/)
    const boxInput = screen.getByLabelText(/Box/)
    const postalCodeInput = screen.getByLabelText(/Postal code/)
    const cityInput = screen.getByLabelText(/City/)
    const countryInput = screen.getByLabelText(/Country/)
    const phoneNumberInput = screen.getByLabelText(/Phone number/)
    const emailInput = screen.getByLabelText(/Email/)
    const passwordInput = screen.getByLabelText(/Password/)
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/)

    // No need to verify if elements exist, getByLabelText will throw an error if they don't exist
    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(firstnameInput, { target: { value: 'Doe' } })
    fireEvent.change(streetInput, { target: { value: 'Main St' } })
    fireEvent.change(numberInput, { target: { value: '123' } })
    fireEvent.change(boxInput, { target: { value: 'A' } })
    fireEvent.change(postalCodeInput, { target: { value: '12345' } })
    fireEvent.change(cityInput, { target: { value: 'City' } })
    fireEvent.change(countryInput, { target: { value: 'Country' } })
    fireEvent.change(phoneNumberInput, { target: { value: '1234567890' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password' } })

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    fireEvent.click(submitButton)

    expect(registerUserMock).toHaveBeenCalledWith({
      name: 'John',
      firstname: 'Doe',
      street: 'Main St',
      number: '123',
      box: 'A',
      postalCode: '12345',
      city: 'City',
      country: 'Country',
      phoneNumber: '1234567890',
      email: 'test@example.com',
      password: 'password',
    })

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login')
    })
  })

  test('handles error when registerUser fails because the email is already used', async () => {
    // Mock registerUser to throw an error
    const registerUserMock = vi
      .fn()
      .mockRejectedValue(new Error('Cette adresse email est déjà utilisée.'))
    const navigateMock = vi.fn()
    const mockContextValue = {
      authenticatedUser: undefined,
      authsMe: vi.fn(),
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
    }

    // Mock console.error
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    vi.mocked(useNavigate).mockReturnValue(navigateMock)

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Select inputs by label
    const nameInput = screen.getByLabelText(/Name/)
    const firstnameInput = screen.getByLabelText(/First name/)
    const streetInput = screen.getByLabelText(/Street/)
    const numberInput = screen.getByLabelText(/Number/)
    const boxInput = screen.getByLabelText(/Box/)
    const postalCodeInput = screen.getByLabelText(/Postal code/)
    const cityInput = screen.getByLabelText(/City/)
    const countryInput = screen.getByLabelText(/Country/)
    const phoneNumberInput = screen.getByLabelText(/Phone number/)
    const emailInput = screen.getByLabelText(/Email/)
    const passwordInput = screen.getByLabelText(/Password/)
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/)

    // Fill in the fields to submit the form
    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(firstnameInput, { target: { value: 'Doe' } })
    fireEvent.change(streetInput, { target: { value: 'Main St' } })
    fireEvent.change(numberInput, { target: { value: '123' } })
    fireEvent.change(boxInput, { target: { value: 'A' } })
    fireEvent.change(postalCodeInput, { target: { value: '12345' } })
    fireEvent.change(cityInput, { target: { value: 'City' } })
    fireEvent.change(countryInput, { target: { value: 'Country' } })
    fireEvent.change(phoneNumberInput, { target: { value: '1234567890' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password' } })

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })

    fireEvent.click(submitButton)

    await waitFor(() => {
      // Verify that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'RegisterPage::error: ',
        expect.any(Error)
      )
      // Verify that navigation was not triggered
      expect(navigateMock).not.toHaveBeenCalled()
    })

    // Check if the correct error is displayed
    const emailErrorMessage = await screen.findByText(
      'Cette adresse email est déjà utilisée.'
    )
    expect(emailErrorMessage).toBeDefined()

    // Restore console.error
    consoleErrorSpy.mockRestore()
  })
  test('displays error when passwords do not match', async () => {
    const registerUserMock = vi.fn()
    const navigateMock = vi.fn()
    const mockContextValue = {
      authenticatedUser: undefined,
      authsMe: vi.fn(),
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
    }

    vi.mocked(useNavigate).mockReturnValue(navigateMock)

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Get input fields
    const nameInput = screen.getByLabelText(/Name/)
    const firstnameInput = screen.getByLabelText(/First name/)
    const streetInput = screen.getByLabelText(/Street/)
    const numberInput = screen.getByLabelText(/Number/)
    const boxInput = screen.getByLabelText(/Box/)
    const postalCodeInput = screen.getByLabelText(/Postal code/)
    const cityInput = screen.getByLabelText(/City/)
    const countryInput = screen.getByLabelText(/Country/)
    const phoneNumberInput = screen.getByLabelText(/Phone number/)
    const emailInput = screen.getByLabelText(/Email/)
    const passwordInput = screen.getByLabelText(/Password/)
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/)

    // Fill in the form with different passwords
    fireEvent.change(nameInput, { target: { value: 'John' } })
    fireEvent.change(firstnameInput, { target: { value: 'Doe' } })
    fireEvent.change(streetInput, { target: { value: 'Main St' } })
    fireEvent.change(numberInput, { target: { value: '123' } })
    fireEvent.change(boxInput, { target: { value: 'A' } })
    fireEvent.change(postalCodeInput, { target: { value: '12345' } })
    fireEvent.change(cityInput, { target: { value: 'City' } })
    fireEvent.change(countryInput, { target: { value: 'Country' } })
    fireEvent.change(phoneNumberInput, { target: { value: '1234567890' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password_12' } })
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'differentPassword' },
    })

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
    fireEvent.click(submitButton)

    // Verify the error message is displayed
    const errorMessage = await screen.findByText(
      'Les mots de passe ne correspondent pas.'
    )
    expect(errorMessage).toBeDefined()

    // Verify that registerUser was not called
    expect(registerUserMock).not.toHaveBeenCalled()

    // Verify that navigation did not occur
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
