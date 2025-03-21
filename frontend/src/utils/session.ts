import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types'

const storeAuthenticatedUser = (authenticatedUser: AuthenticatedUser) => {
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 2)

  // BINARY TO ASCII (btoa)
  const encodedUser = btoa(JSON.stringify(authenticatedUser))

  // Création du cookie avec le token et le user encodé
  document.cookie = `authToken=${authenticatedUser.token}; path=/; expires=${expiryDate.toUTCString()}`
  document.cookie = `authUser=${encodedUser}; path=/; expires=${expiryDate.toUTCString()}`
}

// Récupère l'utilisateur authentifié depuis les cookies
const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  const cookies = document.cookie.split(';')
  let token = null
  let encodedUser = null

  // Recherche les cookies appropriés
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'authToken') token = value
    if (name === 'authUser') encodedUser = value
  }

  if (!token || !encodedUser) return undefined

  try {
    // ASCII TO BINARY (atob)
    return JSON.parse(atob(encodedUser))
  } catch (error) {
    console.error('Erreur de décodage du cookie utilisateur:', error)

    clearAuthenticatedUser()
    return undefined
  }
}

// Supprime les cookies d'authentification
const clearAuthenticatedUser = () => {
  // Défini une date d'expiration dans le passé pour supprimer les cookies
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser }
