import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartVariant {
  id: string
  size?: string
  color?: string
  price?: number
  quantity?: number
}

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string
  variants?: CartVariant[]
  variant?: CartVariant
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
  updateVariant: (itemId: string, variant: CartVariant) => void
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
      updateVariant: (itemId, variant) => {
        const items = get().items
        const currentItem = items.find((item) => item.id === itemId)
        if (!currentItem) return

        const duplicateItem = items.find(
          (item) =>
            item.id !== itemId &&
            item.product.id === currentItem.product.id &&
            item.product.variant?.id === variant.id
        )

        if (duplicateItem) {
          set({
            items: items
              .filter((item) => item.id !== itemId)
              .map((item) =>
                item.id === duplicateItem.id
                  ? { ...item, quantity: item.quantity + currentItem.quantity }
                  : item
              ),
          })
          return
        }

        set({
          items: items.map((item) =>
            item.id === itemId
              ? { ...item, product: { ...item.product, variant } }
              : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          const price = item.product.variant?.price ?? item.product.price
          return total + price * item.quantity
        }, 0),
    }),
    {
      name: "cavree-cart",
    }
  )
)
