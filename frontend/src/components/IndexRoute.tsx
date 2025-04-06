import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext'
import HomePage from '../components/pages/HomePage'

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

export default IndexRoute
