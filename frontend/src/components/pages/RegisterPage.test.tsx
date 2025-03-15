import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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
  })
})