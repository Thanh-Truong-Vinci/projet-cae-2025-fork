import { useState, ReactNode, useCallback } from 'react'
import { CartContext } from './CartContextDefinition'
import { CartItem } from '../types'

export { CartContext } from './CartContextDefinition'

// Removed local declaration of CartItem to avoid conflict with the imported one

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prevItems) => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id)

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += item.quantity
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, item]
      }
    })
  }, [])

  const removeFromCart = useCallback((itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }, [])

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }, [])

  const getCartCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartProvider
