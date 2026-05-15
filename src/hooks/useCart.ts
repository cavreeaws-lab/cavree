import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string
  variant?: {
    id: string
    size?: string
    color?: string
    price?: number
  }
}

interface CartItem {
  id: string
  product: CartProduct
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: CartProduct, quantity?: number, variant?: CartProduct["variant"]) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, variant) => {
        const items = get().items
        const existingItem = items.find(
          (item) =>
            item.product.id === product.id &&
            item.product.variant?.id === variant?.id
        )

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: `${product.id}-${variant?.id || "default"}-${Date.now()}`,
                product: { ...product, variant },
                quantity,
              },
            ],
          })
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) })
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((item) => item.id !== itemId) })
          return
        }
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          const price = item.product.variant?.price || item.product.price
          return total + price * item.quantity
        }, 0),
    }),
    {
      name: "cavree-cart",
    }
  )
)
