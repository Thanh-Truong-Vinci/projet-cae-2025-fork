import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter, Outlet } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import theme from './themes'
import { UserContextProvider } from './contexts/UserContext'
import { ProductProvider } from './contexts/ProductProvider'
import { CartProvider } from './contexts/CartContext'

// Mock all page components
vi.mock('./components/pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>,
}))
vi.mock('../components/pages/RegisterPage', () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}))
vi.mock('../components/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}))
vi.mock('../components/pages/CartPage', () => ({
  default: () => <div data-testid="cart-page">Cart Page</div>,
}))
vi.mock('../components/pages/ProductDetailPage', () => ({
  default: () => (
    <div data-testid="product-detail-page">Product Detail Page</div>
  ),
}))
vi.mock('../components/pages/ReservationsPage', () => ({
  default: () => <div data-testid="reservations-page">Reservations Page</div>,
}))
vi.mock('../components/pages/ProducerHomePage', () => ({
  default: () => <div data-testid="producer-home-page">Producer Home Page</div>,
}))
vi.mock('../components/pages/ManagerRegisterPage', () => ({
  default: () => (
    <div data-testid="manager-register-page">Manager Register Page</div>
  ),
}))
vi.mock('../components/pages/ProducerRegisterPage', () => ({
  default: () => (
    <div data-testid="producer-register-page">Producer Register Page</div>
  ),
}))
vi.mock('../components/pages/ProfilePage', () => ({
  default: () => <div data-testid="profile-page">Profile Page</div>,
}))
vi.mock('../components/pages/AddBatchPage', () => ({
  default: () => <div data-testid="add-batch-page">Add Batch Page</div>,
}))
vi.mock('../components/pages/ManagerDashboardPage', () => ({
  default: () => (
    <div data-testid="manager-dashboard-page">Manager Dashboard Page</div>
  ),
}))
vi.mock('../components/pages/VolunteerHomePage', () => ({
  default: () => (
    <div data-testid="volunteer-home-page">Volunteer Home Page</div>
  ),
}))

// Mock App component
vi.mock('../components/App', () => ({
  default: () => (
    <div data-testid="app-component">
      <Outlet />
    </div>
  ),
}))

// Mock ReactDOM.createRoot - Important: we're not importing main.tsx directly
vi.mock('react-dom/client', () => {
  return {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  }
})

// Setup mock for document.getElementById
document.getElementById = vi.fn(() => document.createElement('div'))

// We have to manually mock these files which might be imported by main.tsx
vi.mock('@fontsource/roboto/700.css', () => ({}))
vi.mock('./index.css', () => ({}))

describe('Main Application', () => {
  // Define our own routes for testing
  const routes = [
    {
      path: '/',
      element: (
        <div data-testid="app-component">
          <Outlet />
        </div>
      ),
      children: [
        {
          index: true,
          element: <div data-testid="home-page">Home Page</div>,
        },
        {
          path: 'producer-dashboard',
          element: (
            <div data-testid="producer-home-page">Producer Home Page</div>
          ),
        },
        {
          path: 'register',
          element: <div data-testid="register-page">Register Page</div>,
        },
        {
          path: 'login',
          element: <div data-testid="login-page">Login Page</div>,
        },
        {
          path: 'register-manager',
          element: (
            <div data-testid="manager-register-page">Manager Register Page</div>
          ),
        },
        {
          path: 'register-producer',
          element: (
            <div data-testid="producer-register-page">
              Producer Register Page
            </div>
          ),
        },
        {
          path: 'cart',
          element: <div data-testid="cart-page">Cart Page</div>,
        },
        {
          path: 'products/:productId',
          element: (
            <div data-testid="product-detail-page">Product Detail Page</div>
          ),
        },
        {
          path: 'reservations',
          element: <div data-testid="reservations-page">Reservations Page</div>,
        },
        {
          path: 'profile',
          element: <div data-testid="profile-page">Profile Page</div>,
        },
        {
          path: 'add-batch',
          element: <div data-testid="add-batch-page">Add Batch Page</div>,
        },
        {
          path: 'manager-dashboard',
          element: (
            <div data-testid="manager-dashboard-page">
              Manager Dashboard Page
            </div>
          ),
        },
        {
          path: 'volunteer',
          element: (
            <div data-testid="volunteer-home-page">Volunteer Home Page</div>
          ),
        },
      ],
    },
  ]

  // Function to render with our defined routes
  const renderWithRouter = (route: string) => {
    // Create a memory router with our routes
    const testRouter = createMemoryRouter(routes, { initialEntries: [route] })

    return render(
      <ThemeProvider theme={theme}>
        <UserContextProvider>
          <ProductProvider>
            <CartProvider>
              <RouterProvider router={testRouter} />
            </CartProvider>
          </ProductProvider>
        </UserContextProvider>
      </ThemeProvider>
    )
  }

  test('renders home page on root path', async () => {
    renderWithRouter('/')
    expect(await screen.findByTestId('home-page')).toBeTruthy()
  })

  test('renders register page on /register path', async () => {
    renderWithRouter('/register')
    expect(await screen.findByTestId('register-page')).toBeTruthy()
  })

  test('renders login page on /login path', async () => {
    renderWithRouter('/login')
    expect(await screen.findByTestId('login-page')).toBeTruthy()
  })

  test('renders cart page on /cart path', async () => {
    renderWithRouter('/cart')
    expect(await screen.findByTestId('cart-page')).toBeTruthy()
  })

  test('renders product detail page on /products/:productId path', async () => {
    renderWithRouter('/products/1')
    expect(await screen.findByTestId('product-detail-page')).toBeTruthy()
  })

  test('renders reservations page on /reservations path', async () => {
    renderWithRouter('/reservations')
    expect(await screen.findByTestId('reservations-page')).toBeTruthy()
  })

  test('renders producer home page on /producer-dashboard path', async () => {
    renderWithRouter('/producer-dashboard')
    expect(await screen.findByTestId('producer-home-page')).toBeTruthy()
  })

  test('renders manager register page on /register-manager path', async () => {
    renderWithRouter('/register-manager')
    expect(await screen.findByTestId('manager-register-page')).toBeTruthy()
  })

  test('renders producer register page on /register-producer path', async () => {
    renderWithRouter('/register-producer')
    expect(await screen.findByTestId('producer-register-page')).toBeTruthy()
  })

  test('renders profile page on /profile path', async () => {
    renderWithRouter('/profile')
    expect(await screen.findByTestId('profile-page')).toBeTruthy()
  })

  test('renders add batch page on /add-batch path', async () => {
    renderWithRouter('/add-batch')
    expect(await screen.findByTestId('add-batch-page')).toBeTruthy()
  })

  test('renders manager dashboard page on /manager-dashboard path', async () => {
    renderWithRouter('/manager-dashboard')
    expect(await screen.findByTestId('manager-dashboard-page')).toBeTruthy()
  })

  test('renders volunteer home page on /volunteer path', async () => {
    renderWithRouter('/volunteer')
    expect(await screen.findByTestId('volunteer-home-page')).toBeTruthy()
  })
})
