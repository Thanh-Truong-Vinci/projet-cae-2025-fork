import React, { ReactNode, useContext } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { RouterProvider, createBrowserRouter, Navigate, } from 'react-router-dom'
import App from './components/App/index.tsx'
import HomePage from './components/pages/HomePage.tsx'
import RegisterPage from './components/pages/RegisterPage.tsx'
import LoginPage from './components/pages/LoginPage.tsx'
import CartPage from './components/pages/CartPage.tsx'
import ProductDetailPage from './components/pages/ProductDetailPage'
import ReservationsPage from './components/pages/ReservationsPage'
import AddBatchPage from './components/pages/AddBatchPage.tsx'
import ProducerHomePage from './components/pages/ProducerHomePage.tsx'
import { UserContext, UserContextProvider } from './contexts/UserContext.tsx'
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

// Fonction de protection pour les routes qui nécessitent une authentification
const ProtectedRoute = ({ children, requiredRole }: { children: ReactNode, requiredRole?: string | string[] }) => {
  const { authenticatedUser } = useContext(UserContext)

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!authenticatedUser) {
    return <Navigate to="/login" replace />
  }

  // Si un rôle spécifique est requis, vérifier que l'utilisateur le possède
  if (requiredRole) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(authenticatedUser.role)
      : authenticatedUser.role === requiredRole

    if (!hasRequiredRole) {
      // Rediriger vers la page d'accueil si l'utilisateur n'a pas le rôle requis
      return <Navigate to="/" replace />
    }
  }

  // Si tout est en ordre, afficher les enfants (la route protégée)
  return <>{children}</>
}

// Index Route avec redirection basée sur le rôle
const IndexRoute = () => {
  const { authenticatedUser } = useContext(UserContext)

  // Redirection basée sur le rôle de l'utilisateur
  if (authenticatedUser) {
    switch (authenticatedUser.role) {
      case 'Producer':
        return <Navigate to="/producer-dashboard" replace />
      case 'Manager':
        return <Navigate to="/manager-dashboard" replace />
      case 'Volunteer':
        return <Navigate to="/volunteer" replace />
      case 'Client':
      default:
        // Les clients peuvent voir la HomePage
        return <HomePage />
    }
  }

  // Utilisateurs non connectés peuvent voir la HomePage
  return <HomePage />
}

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
        element: <ProtectedRoute requiredRole="Producer"><ProducerHomePage /></ProtectedRoute>,
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
        element: <ProtectedRoute requiredRole="Manager"><ManagerRegisterPage /></ProtectedRoute>,
      },
      {
        path: 'register-producer',
        element: <ProtectedRoute requiredRole="Manager"><ProducerRegisterPage /></ProtectedRoute>,
      },
      {
        path: 'cart',
        element: <ProtectedRoute requiredRole="Client"><CartPage /></ProtectedRoute>,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'reservations',
        element: <ProtectedRoute requiredRole="Client"><ReservationsPage /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: 'add-product',
        element: <ProtectedRoute requiredRole="Producer"><AddBatchPage /></ProtectedRoute>,
      },
      {
        path: 'manager-dashboard',
        element: <ProtectedRoute requiredRole="Manager"><ManagerDashboardPage /></ProtectedRoute>,
      },
      {
        path: 'volunteer',
        element: <ProtectedRoute requiredRole="Volunteer"><VolunteerHomePage /></ProtectedRoute>,
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
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </BatchProvider>
        </ProductProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>
)