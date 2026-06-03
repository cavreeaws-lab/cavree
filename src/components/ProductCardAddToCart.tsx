"use client"

import { useMemo, useState } from "react"
import { ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"
import { useCart, type CartVariant } from "@/hooks/useCart"

interface ProductCardAddToCartProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    images?: Array<{ url: string }>
    variants?: CartVariant[]
  }
  className?: string
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

function sizeRank(size?: string) {
  const index = SIZE_ORDER.indexOf(size || "")
  return index === -1 ? SIZE_ORDER.length : index
}

export default function ProductCardAddToCart({ product, className = "" }: ProductCardAddToCartProps) {
  const { addItem } = useCart()
  const [chooserOpen, setChooserOpen] = useState(false)
  const image = product.images?.[0]?.url || "/images/placeholder.jpg"
  const variants = product.variants || []
  const visibleVariants = useMemo(() => {
    const seen = new Set<string>()
    return variants
      .slice()
      .sort((a, b) => sizeRank(a.size) - sizeRank(b.size) || (a.size || "").localeCompare(b.size || ""))
      .filter((variant) => {
        const label = variant.size || variant.color || variant.id
        if (seen.has(label)) return false
        seen.add(label)
        return true
      })
  }, [variants])
  const hasVariants = variants.length > 0

  const addProduct = (variant?: CartVariant) => {
    if (hasVariants && !variant) {
      setChooserOpen(true)
      return
    }

    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image,
        variants,
      },
      1,
      variant
        ? {
            id: variant.id,
            size: variant.size,
            color: variant.color,
            price: variant.price,
            quantity: variant.quantity,
          }
        : undefined
    )
    setChooserOpen(false)
    toast.success("Added to cart!")
  }

  return (
    <div className={`mt-2 space-y-2 ${className}`}>
      {hasVariants && chooserOpen && (
        <div className="rounded-md border border-cavree-border bg-white p-2 shadow-sm">
          <p className="mb-2 text-xs font-medium text-cavree-muted">Select size</p>
          <div className="flex flex-wrap gap-1.5">
            {visibleVariants.map((variant) => {
              const isOut = (variant.quantity ?? 0) <= 0
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => !isOut && addProduct(variant)}
                  disabled={isOut}
                  className="min-w-9 rounded border border-cavree-border px-2 py-1.5 text-xs font-medium text-cavree-foreground transition-colors hover:border-cavree-primary hover:bg-cavree-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Select ${variant.size || variant.color || "variant"}`}
                >
                  {variant.size || variant.color || "One"}
                </button>
              )
            })}
          </div>
        </div>
      )}
      {(!hasVariants || !chooserOpen) && (
        <button
          onClick={() => addProduct()}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-cavree-primary text-cavree-primary text-sm font-medium rounded-md hover:bg-cavree-primary hover:text-white transition-colors"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      )}
    </div>
  )
}
