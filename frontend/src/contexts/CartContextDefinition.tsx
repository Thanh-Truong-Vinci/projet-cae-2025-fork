import { createContext } from 'react'

export interface CartItem {
  id: number
  name: string
  price: string
  image: string
  quantity: number
  unitType: string  // Ajoutez cette ligne pour inclure le type d'unité
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  getCartCount: () => number
  clearCart: () => void
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  getCartCount: () => 0,
  clearCart: () => {},
})
