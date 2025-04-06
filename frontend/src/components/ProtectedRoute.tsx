import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
};

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { authenticatedUser } = useContext(UserContext);
  const location = useLocation();

  // Si l'authentification est requise et l'utilisateur n'est pas connecté
  if (requireAuth && !authenticatedUser) {
    // Rediriger vers la page de connexion avec l'URL source pour redirect après login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si des rôles sont spécifiés et l'utilisateur n'a pas le rôle requis
  if (allowedRoles.length > 0 && (!authenticatedUser?.role || !allowedRoles.includes(authenticatedUser.role))) {
    // Rediriger vers la page d'accueil ou une page d'accès refusé
    return <Navigate to="/" replace />;
  }

  // Si toutes les conditions sont satisfaites, afficher le contenu de la route
  return <>{children}</>;
};

export default ProtectedRoute;