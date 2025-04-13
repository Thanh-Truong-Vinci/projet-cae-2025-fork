import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
import App from './components/App/index.tsx'
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
import SimpleProtectedRoute from './components/SimpleProtectedRoute.tsx'
import IndexRoute from './components/IndexRoute.tsx'
import ReceivedProductsPage from './components/pages/ReceivedProductsPage.tsx'
import { PhotoProvider } from './contexts/PhotoProvider.tsx'
import { ReservationProvider } from './contexts/ReservationProvider'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <IndexRoute />,
      },
      {
        path: 'producer-dashboard',
        element: (
          <SimpleProtectedRoute requiredRole="Producer">
            <ProducerHomePage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register-manager',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <ManagerRegisterPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'register-producer',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <ProducerRegisterPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'cart',
        element: (
          <SimpleProtectedRoute requiredRole="Client">
            <CartPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'reservations',
        element: (
          <SimpleProtectedRoute requiredRole="Client">
            <ReservationsPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <SimpleProtectedRoute>
            <ProfilePage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'add-batch',
        element: (
          <SimpleProtectedRoute requiredRole="Producer">
            <AddBatchPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'manager-dashboard',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <ManagerDashboardPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'volunteer',
        element: (
          <SimpleProtectedRoute requiredRole="Volunteer">
            <VolunteerHomePage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'received-products',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <ReceivedProductsPage />
          </SimpleProtectedRoute>
        ),
      },
      // Route de secours pour toutes les autres URL
      {
        path: '*',
        element: <Navigate to="/" replace />,
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
            <PhotoProvider>
              <CartProvider>
                <ReservationProvider>
                  <RouterProvider router={router} />
                </ReservationProvider>
              </CartProvider>
            </PhotoProvider>
          </BatchProvider>
        </ProductProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)
