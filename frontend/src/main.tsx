import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './components/App/index.tsx'
import HomePage from './components/pages/HomePage.tsx'
import RegisterPage from './components/pages/RegisterPage.tsx'
import LoginPage from './components/pages/LoginPage.tsx'
import CartPage from './components/pages/CartPage.tsx'
import ProductDetailPage from './components/pages/ProductDetailPage'
import ReservationsPage from './components/pages/ReservationsPage'
import AddBatchPage from './components/pages/AddBatchPage.tsx'
import ProducerHomePage from './components/pages/ProducerHomePage.tsx'
import { UserContextProvider } from './contexts/UserContext.tsx'
import { CartProvider } from './contexts/CartContext.tsx'
import '@fontsource/roboto/700.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import theme from './themes.ts'
import ManagerRegisterPage from './components/pages/ManagerRegisterPage.tsx'
import ProducerRegisterPage from './components/pages/ProducerRegisterPage.tsx'
import { ProductProvider } from './contexts/ProductProvider.tsx'
import { BatchProvider } from './contexts/BatchProvider.tsx'
import ProfilePage from './components/pages/ProfilePage.tsx'
import ManagerDashboardPage from './components/pages/ManagerDashboardPage.tsx'
import VolunteerHomePage from './components/pages/VolunteerHomePage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'producer-dashboard',
        element: (
          <ProtectedRoute allowedRoles={['Producer']}>
            <ProducerHomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <ProtectedRoute requireAuth={false}>
            <RegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register-manager',
        element: (
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <ManagerRegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'register-producer',
        element: (
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <ProducerRegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute allowedRoles={['Client']}>
            <CartPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'reservations',
        element: (
          <ProtectedRoute allowedRoles={['Client']}>
            <ReservationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'add-product',
        element: (
          <ProtectedRoute allowedRoles={['Producer']}>
            <AddBatchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'manager-dashboard',
        element: (
          <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'volunteer',
        element: (
          <ProtectedRoute allowedRoles={['Volunteer', 'Admin']}>
            <VolunteerHomePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContextProvider>
        <ProductProvider>
          <BatchProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </BatchProvider>
        </ProductProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)
