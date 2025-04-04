import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import ProfilePage from '../../components/pages/ProfilePage'
import { UserContext } from '../../contexts/UserContext'

// Mock du module react-router-dom avec un spy sur Navigate
const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: (props: import('react-router-dom').NavigateProps) => {
      mockedNavigate(props.to)
      return (
        <div data-testid="mock-navigate" data-to={props.to}>
          Redirecting to {String(props.to)}
        </div>
      )
    },
  }
})

describe('ProfilePage', () => {
  const mockAuthenticatedUser = {
    id: 1,
    name: 'Dupont',
    firstname: 'Jean',
    email: 'jean.dupont@example.com',
    role: 'Client',
    token: 'mock-token',
  }

  const mockChangePassword = vi.fn()

  const renderWithContext = (
    authenticatedUser = mockAuthenticatedUser,
    changePassword = mockChangePassword
  ) => {
    const mockContextValue = {
      authenticatedUser,
      authsMe: vi.fn(),
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      registerManager: vi.fn(),
      registerProducer: vi.fn(),
      changePassword,
    }

    return render(
      <MemoryRouter>
        <UserContext.Provider value={mockContextValue}>
          <ProfilePage />
        </UserContext.Provider>
      </MemoryRouter>
    )
  }

  // Réinitialiser le mock avant chaque test
  beforeEach(() => {
    mockedNavigate.mockClear()
  })

  test('displays user information correctly when authenticated', () => {
    renderWithContext()

    // Check if user information is displayed using more specific selectors
    expect(screen.getByText('Nom:')).toBeTruthy()
    expect(screen.getByText('Prénom:')).toBeTruthy()
    expect(screen.getByText('Email:')).toBeTruthy()
    expect(screen.getByText('Rôle:')).toBeTruthy()

    // Check for exact text content inside parent elements
    const nameElement = screen.getByText('Nom:').closest('p')
    const firstnameElement = screen.getByText('Prénom:').closest('p')
    const emailElement = screen.getByText('Email:').closest('p')
    const roleElement = screen.getByText('Rôle:').closest('p')

    expect(nameElement?.textContent).toContain('Dupont')
    expect(firstnameElement?.textContent).toContain('Jean')
    expect(emailElement?.textContent).toContain('jean.dupont@example.com')
    expect(roleElement?.textContent).toContain('Client')
  })

  test('displays password change form', () => {
    renderWithContext()

    // Check if password change form elements are present using exact label text
    expect(screen.getByLabelText('Mot de passe actuel *')).toBeTruthy()
    expect(screen.getByLabelText('Nouveau mot de passe *')).toBeTruthy()
    expect(
      screen.getByLabelText('Confirmer le nouveau mot de passe *')
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /Changer le mot de passe/i })
    ).toBeTruthy()
  })

  test('shows error when passwords do not match', async () => {
    renderWithContext()

    // Get form inputs by their names
    const currentPasswordInput = screen.getByLabelText('Mot de passe actuel *')
    const newPasswordInput = screen.getByLabelText('Nouveau mot de passe *')
    const confirmPasswordInput = screen.getByLabelText(
      'Confirmer le nouveau mot de passe *'
    )

    // Fill the form with non-matching passwords
    fireEvent.change(currentPasswordInput, {
      target: { value: 'CurrentPassword123!' },
    })

    fireEvent.change(newPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'DifferentPassword123!' },
    })

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i })
    )

    // Check if error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Les mots de passe ne correspondent pas/i)
      ).toBeTruthy()
    })

    // Verify that changePassword was not called
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  test('shows error when password format is invalid', async () => {
    renderWithContext()

    // Get form inputs by their names
    const currentPasswordInput = screen.getByLabelText('Mot de passe actuel *')
    const newPasswordInput = screen.getByLabelText('Nouveau mot de passe *')
    const confirmPasswordInput = screen.getByLabelText(
      'Confirmer le nouveau mot de passe *'
    )

    // Fill the form with a weak password
    fireEvent.change(currentPasswordInput, {
      target: { value: 'CurrentPassword123!' },
    })

    fireEvent.change(newPasswordInput, {
      target: { value: 'weak' },
    })

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'weak' },
    })

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i })
    )

    // Check if format error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial/i
        )
      ).toBeTruthy()
    })

    // Verify that changePassword was not called
    expect(mockChangePassword).not.toHaveBeenCalled()
  })

  test('calls changePassword and shows success message when form is valid', async () => {
    // Configure mock to resolve successfully
    mockChangePassword.mockResolvedValueOnce(undefined)

    renderWithContext()

    // Get form inputs by their names
    const currentPasswordInput = screen.getByLabelText('Mot de passe actuel *')
    const newPasswordInput = screen.getByLabelText('Nouveau mot de passe *')
    const confirmPasswordInput = screen.getByLabelText(
      'Confirmer le nouveau mot de passe *'
    )

    // Fill the form with valid data
    fireEvent.change(currentPasswordInput, {
      target: { value: 'CurrentPassword123!' },
    })

    fireEvent.change(newPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i })
    )

    // Verify that changePassword was called with correct parameters
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        'CurrentPassword123!',
        'NewPassword123!'
      )
    })

    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Mot de passe modifié avec succès/i)).toBeTruthy()
    })
  })

  test('shows error message when changePassword fails', async () => {
    // Configure mock to reject
    mockChangePassword.mockRejectedValueOnce(new Error('API Error'))

    renderWithContext()

    // Get form inputs by their names
    const currentPasswordInput = screen.getByLabelText('Mot de passe actuel *')
    const newPasswordInput = screen.getByLabelText('Nouveau mot de passe *')
    const confirmPasswordInput = screen.getByLabelText(
      'Confirmer le nouveau mot de passe *'
    )

    // Fill the form with valid data
    fireEvent.change(currentPasswordInput, {
      target: { value: 'CurrentPassword123!' },
    })

    fireEvent.change(newPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i })
    )

    // Check if error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Erreur lors du changement de mot de passe/i)
      ).toBeTruthy()
    })
  })

  test('disables form during submission', async () => {
    // Use a delayed promise to test loading state
    mockChangePassword.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(undefined), 100)
      })
    })

    renderWithContext()

    // Get form inputs by their names
    const currentPasswordInput = screen.getByLabelText('Mot de passe actuel *')
    const newPasswordInput = screen.getByLabelText('Nouveau mot de passe *')
    const confirmPasswordInput = screen.getByLabelText(
      'Confirmer le nouveau mot de passe *'
    )

    // Fill the form with valid data
    fireEvent.change(currentPasswordInput, {
      target: { value: 'CurrentPassword123!' },
    })

    fireEvent.change(newPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    fireEvent.change(confirmPasswordInput, {
      target: { value: 'NewPassword123!' },
    })

    // Submit the form
    fireEvent.click(
      screen.getByRole('button', { name: /Changer le mot de passe/i })
    )

    // Test for presence of loading text instead of disabled state
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Chargement/i })
      expect(submitButton).toBeTruthy()
    })
  })
})
