"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"

export default function RecentlyViewed() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/recently-viewed")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || products.length === 0) return null

  return (
    <section className="mt-16">
      <h3 className="font-playfair text-xl font-bold mb-6 flex items-center gap-2">
        <Clock size={20} /> Recently Viewed
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.slug}`} className="group">
            <div className="relative aspect-square rounded-md overflow-hidden bg-cavree-light mb-2">
              <Image
                src={product.images[0]?.url || "/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <p className="font-medium text-sm truncate">{product.name}</p>
            <p className="text-xs text-cavree-muted">{product.category?.name}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
