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
import ProfilePage from './components/pages/ProfilePage.tsx'
import ManagerDashboardPage from './components/pages/ManagerDashboardPage.tsx'
import VolunteerHomePage from './components/pages/VolunteerHomePage.tsx'

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
        element: <ProducerHomePage />,
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
        element: <ManagerRegisterPage />,
      },
      {
        path: 'register-producer',
        element: <ProducerRegisterPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'reservations',
        element: <ReservationsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'add-product',
        element: <AddBatchPage />,
      },
      {
        path: 'manager-dashboard',
        element: <ManagerDashboardPage />,
      },
      {
        path: 'volunteer',
        element: <VolunteerHomePage />,
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
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </ProductProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)
