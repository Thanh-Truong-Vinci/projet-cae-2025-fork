import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import axios from 'axios';
import { RouterProvider, createHashRouter, Navigate } from 'react-router-dom'
import App from './components/App/index.tsx'
import RegisterPage from './components/pages/RegisterPage.tsx'
import LoginPage from './components/pages/LoginPage.tsx'
import CartPage from './components/pages/CartPage.tsx'
import ProductDetailPage from './components/pages/ProductDetailPage'
import ReservationsPage from './components/pages/ReservationsPage'
import AddBatchPage from './components/pages/AddBatchPage.tsx'
import ProducerHomePage from './components/pages/ProducerHomePage.tsx'
import { UserContextProvider } from './contexts/UserContext.tsx'
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
import ManageProductTypesPage from './components/pages/ManageProductTypesPage.tsx'
import { ProductTypeProvider } from './contexts/ProductTypeProvider.tsx'
import { ReservationProvider } from './contexts/ReservationProvider'
import HandlePendingBatchesPage from './components/pages/HandlePendingBatchesPage'
import { StatisticsProvider } from './contexts/StatisticsProvider'
import NotificationsPage from './components/pages/NotificationPage.tsx'
import { NotificationProvider } from './contexts/NotificationProvider.tsx'
import ReceiveBatchesPage from './components/pages/ReceiveBatchesPage.tsx'

  axios.defaults.baseURL = import.meta.env.VITE_API_URL;


const router = createHashRouter([
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
            <StatisticsProvider>
              <ManagerDashboardPage />
            </StatisticsProvider>
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
      {
        path: 'manage-product-types',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <ManageProductTypesPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'pending-batches',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <HandlePendingBatchesPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <SimpleProtectedRoute requiredRole="Producer">
            <NotificationsPage />
          </SimpleProtectedRoute>
        ),
      },
      {
        path: 'receive-batches',
        element: (
          <SimpleProtectedRoute requiredRole="Manager">
            <ReceiveBatchesPage />
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
        <NotificationProvider>
          <ProductTypeProvider>
            <ProductProvider>
              <BatchProvider>
                <PhotoProvider>
                  <ReservationProvider>
                    <RouterProvider router={router} />
                  </ReservationProvider>
                </PhotoProvider>
              </BatchProvider>
            </ProductProvider>
          </ProductTypeProvider>
        </NotificationProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)
