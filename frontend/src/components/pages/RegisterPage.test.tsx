import { fireEvent, render, screen } from '@testing-library/react'
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

  test('displays error when passwords do not match', async () => {
    const registerUserMock = vi.fn()
    const navigateMock = vi.fn()
    const mockContextValue = {
      authenticatedUser: undefined,
      authsMe: vi.fn(),
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword: vi.fn(),
    }

    vi.mocked(useNavigate).mockReturnValue(navigateMock)

    render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <RegisterPage />
        </UserContext.Provider>
      </MemoryRouter>
    )

    // Récupérer les inputs à l'intérieur des TextField avec querySelector
    const nameInput = screen.getByTestId('name-input').querySelector('input')
    const firstnameInput = screen
      .getByTestId('firstname-input')
      .querySelector('input')
    const streetInput = screen
      .getByTestId('street-input')
      .querySelector('input')
    const numberInput = screen
      .getByTestId('number-input')
      .querySelector('input')
    const boxInput = screen.getByTestId('box-input').querySelector('input')
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
      .getByTestId('confirmPassword-input')
      .querySelector('input')

    // Vérifier que tous les éléments d'entrée ont été trouvés
    if (
      nameInput &&
      firstnameInput &&
      streetInput &&
      numberInput &&
      boxInput &&
      postalCodeInput &&
      cityInput &&
      countryInput &&
      phoneNumberInput &&
      emailInput &&
      passwordInput &&
      confirmPasswordInput
    ) {
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
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'differentPassword' },
      })

      const submitButton = screen.getByRole('button', { name: /s'inscrire/i })
      fireEvent.click(submitButton)

      // Verify that registerUser was not called
      expect(registerUserMock).not.toHaveBeenCalled()

      // Verify that navigation did not occur
      expect(navigateMock).not.toHaveBeenCalled()
    } else {
      throw new Error(
        "Un ou plusieurs champs d'entrée n'ont pas été trouvés correctement"
      )
    }
  })
})
