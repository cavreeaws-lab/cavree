"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useCart } from "@/hooks/useCart"

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    slug: string
    price: number
    images: { url: string }[]
  }
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  const fetchWishlist = () => {
    setLoading(true)
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load wishlist")
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Removed from wishlist")
      fetchWishlist()
    } catch {
      toast.error("Failed to remove")
    }
  }

  const addToCart = (item: WishlistItem) => {
    addItem({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      image: item.product.images[0]?.url || "/images/placeholder.jpg",
    })
    toast.success("Added to cart!")
  }

  if (loading) {
    return (
      <div className="border border-cavree-border rounded-lg p-6">
        <h2 className="font-playfair text-xl font-bold mb-6">My Wishlist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse border border-cavree-border rounded-lg p-4">
              <div className="h-40 bg-gray-200 rounded-md" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="border border-cavree-border rounded-lg p-6">
        <h2 className="font-playfair text-xl font-bold mb-6">My Wishlist</h2>
        <div className="text-center py-16">
          <Heart size={48} className="mx-auto text-cavree-muted-light" />
          <h3 className="font-playfair text-lg font-bold mt-4">Your Wishlist is Empty</h3>
          <p className="text-cavree-muted mt-1 font-poppins text-sm">Save your favorite items here</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-cavree-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-cavree-primary-light transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-cavree-border rounded-lg p-6">
      <h2 className="font-playfair text-xl font-bold mb-6">My Wishlist ({items.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-cavree-border rounded-lg overflow-hidden group">
            <Link href={`/product/${item.product.slug}`} className="relative block aspect-square bg-cavree-light">
              <Image
                src={item.product.images[0]?.url || "/images/placeholder.jpg"}
                alt={item.product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="p-4">
              <Link href={`/product/${item.product.slug}`}>
                <h3 className="font-medium text-sm line-clamp-1 hover:text-cavree-primary transition-colors">{item.product.name}</h3>
              </Link>
              <p className="font-montserrat font-semibold text-sm mt-1">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(item.product.price)}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => addToCart(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-cavree-primary text-white text-xs font-medium py-2 rounded-md hover:bg-cavree-primary-light transition-colors"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 border border-cavree-border rounded-md text-cavree-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
