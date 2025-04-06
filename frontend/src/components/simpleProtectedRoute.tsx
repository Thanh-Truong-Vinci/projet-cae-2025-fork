import { useContext, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string | string[]
}

const simpleProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
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

export default simpleProtectedRoute
