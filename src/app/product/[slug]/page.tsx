"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { ShoppingBag, Heart, Star, Truck, RotateCcw, Shield, Minus, Plus, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("description")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.slug])

  const handleSubmitReview = async () => {
    if (!product) return
    setSubmittingReview(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, rating: reviewRating, comment: reviewComment }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to submit review")
      } else {
        toast.success("Review submitted!")
        setReviewComment("")
        setReviewRating(5)
        // Refresh product to show new review
        fetch(`/api/products/${params.slug}`)
          .then((res) => res.json())
          .then((data) => setProduct(data.product))
      }
    } catch {
      toast.error("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.variants?.length > 0) {
      const match = product.variants.find((v: any) => {
        if (selectedSize && selectedColor) return v.size === selectedSize && v.color === selectedColor
        if (selectedSize) return v.size === selectedSize
        if (selectedColor) return v.color === selectedColor
        return false
      })
      if (!match) {
        toast.error("Please select a valid size/color")
        return
      }
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0]?.url || "/images/placeholder.jpg",
        },
        quantity,
        { id: match.id, size: match.size, color: match.color, price: match.price ?? product.price }
      )
    } else {
      addItem(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0]?.url || "/images/placeholder.jpg",
        },
        quantity
      )
    }
    toast.success("Added to cart!")
  }

  const sizes = Array.from(new Set<string>(product?.variants?.map((v: any) => v.size).filter(Boolean)))
  const colors = Array.from(new Set<string>(product?.variants?.map((v: any) => v.color).filter(Boolean)))

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-playfair text-2xl font-bold">Product Not Found</h1>
        <Link href="/shop" className="mt-4 inline-block text-cavree-primary hover:underline">
          Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-cavree-muted font-poppins mb-6">
        <Link href="/" className="hover:text-cavree-primary">Home</Link>
        <ChevronRight size={14} className="inline mx-1" />
        <Link href="/shop" className="hover:text-cavree-primary">Shop</Link>
        <ChevronRight size={14} className="inline mx-1" />
        <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cavree-light">
            <Image
              src={product.images[selectedImage]?.url || "/images/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === idx ? "border-cavree-primary" : "border-transparent"}`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-cavree-muted font-poppins">{product.category?.name}</p>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < 4 ? "text-cavree-accent fill-cavree-accent" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-sm text-cavree-muted font-poppins">({product._count?.reviews || 0} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="font-montserrat text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-cavree-muted-light line-through">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.comparePrice)}
              </span>
            )}
          </div>

          <p className="text-cavree-muted font-poppins text-sm leading-relaxed mt-6">
            {product.description || "No description available."}
          </p>

          {/* Size */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-montserrat font-semibold text-sm mb-3">SIZE</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${selectedSize === size ? "border-cavree-primary bg-cavree-primary text-white" : "border-cavree-border hover:border-cavree-primary"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-montserrat font-semibold text-sm mb-3">COLOR</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${selectedColor === color ? "border-cavree-primary bg-cavree-primary text-white" : "border-cavree-border hover:border-cavree-primary"}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="font-montserrat font-semibold text-sm mb-3">QUANTITY</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-cavree-border rounded-md flex items-center justify-center hover:border-cavree-primary transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-montserrat font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-cavree-border rounded-md flex items-center justify-center hover:border-cavree-primary transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-cavree-primary hover:bg-cavree-primary-light text-white py-3.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>
            <button className="w-14 border border-cavree-border rounded-md flex items-center justify-center hover:border-cavree-primary hover:text-cavree-primary transition-colors">
              <Heart size={20} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-cavree-border">
            <div className="text-center">
              <Truck size={24} className="mx-auto text-cavree-primary" />
              <p className="text-xs mt-2 font-poppins text-cavree-muted">Free Shipping</p>
            </div>
            <div className="text-center">
              <RotateCcw size={24} className="mx-auto text-cavree-primary" />
              <p className="text-xs mt-2 font-poppins text-cavree-muted">Easy Returns</p>
            </div>
            <div className="text-center">
              <Shield size={24} className="mx-auto text-cavree-primary" />
              <p className="text-xs mt-2 font-poppins text-cavree-muted">Secure Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div className="flex gap-8 border-b border-cavree-border">
          {["description", "reviews", "shipping"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "text-cavree-primary border-b-2 border-cavree-primary" : "text-cavree-muted hover:text-cavree-foreground"}`}
            >
              {tab === "reviews" ? `Reviews (${product.reviews?.length || 0})` : tab}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "description" && (
            <div className="prose max-w-none font-poppins text-sm leading-relaxed text-cavree-muted">
              {product.description || "No description available."}
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Review Form */}
              <div className="border border-cavree-border rounded-lg p-5">
                <h3 className="font-medium text-sm mb-3">Write a Review</h3>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setReviewRating(star)}>
                      <Star size={18} className={star <= reviewRating ? "text-cavree-accent fill-cavree-accent" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                  className="w-full border border-cavree-border rounded-md px-3 py-2 text-sm outline-none focus:border-cavree-primary resize-none"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="mt-3 bg-cavree-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cavree-primary-light disabled:opacity-50 transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>

              {product.reviews?.length === 0 ? (
                <p className="text-cavree-muted font-poppins">No reviews yet.</p>
              ) : (
                <div className="space-y-6">
                  {product.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-cavree-border pb-6">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? "text-cavree-accent fill-cavree-accent" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.user?.name || "Anonymous"}</span>
                      </div>
                      <p className="mt-2 text-sm font-poppins text-cavree-muted">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "shipping" && (
            <div className="font-poppins text-sm text-cavree-muted space-y-2">
              <p>Free shipping on orders above ₹5000.</p>
              <p>Standard delivery: 5-7 business days.</p>
              <p>Cash on Delivery available for orders below ₹10000.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
