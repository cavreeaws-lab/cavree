"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import {
  ShoppingBag,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Shield,
  Minus,
  Plus,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  X,
  Ruler,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import RecentlyViewed from "@/components/RecentlyViewed"
import { PriceDisplay } from "@/components/PriceDisplay"
import { getProductDiscount } from "@/lib/utils"

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

function sizeRank(size?: string) {
  const index = SIZE_ORDER.indexOf(size || "")
  return index === -1 ? SIZE_ORDER.length : index
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
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
  const [touchStart, setTouchStart] = useState<number | null>(null)

  // New states
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product)
        setLoading(false)
        if (data.product?.id) {
          fetch("/api/recently-viewed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: data.product.id }),
          }).catch(() => {})
        }
      })
      .catch(() => setLoading(false))
  }, [params.slug])

  // Fetch related products when product loads
  useEffect(() => {
    if (!product?.category?.slug) return
    setRelatedLoading(true)
    fetch(`/api/products?category=${product.category.slug}&limit=4`)
      .then((res) => res.json())
      .then((data) => {
        // Exclude current product from related
        const filtered = (data.products || []).filter((p: any) => p.slug !== product.slug)
        setRelatedProducts(filtered.slice(0, 4))
        setRelatedLoading(false)
      })
      .catch(() => setRelatedLoading(false))
  }, [product?.category?.slug, product?.slug])

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

  const handleBuyNow = () => {
    if (!product) return
    handleAddToCart()
    router.push("/checkout")
  }

  const toggleWishlist = async () => {
    if (!product) return
    setTogglingWishlist(true)
    try {
      if (inWishlist) {
        const res = await fetch(`/api/wishlist/${product.id}`, { method: "DELETE" })
        if (res.ok) {
          setInWishlist(false)
          toast.success("Removed from wishlist")
        } else if (res.status === 401) {
          router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname))
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
        if (res.ok) {
          setInWishlist(true)
          toast.success("Added to wishlist")
        } else if (res.status === 401) {
          router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname))
        } else {
          const data = await res.json()
          toast.error(data.error || "Failed to add")
        }
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setTogglingWishlist(false)
    }
  }

  useEffect(() => {
    if (!product?.id) return
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const items = data.items || []
        setInWishlist(items.some((item: any) => item.productId === product.id))
      })
      .catch(() => {})
  }, [product?.id])

  const sizes = Array.from(new Set<string>(product?.variants?.map((v: any) => v.size).filter(Boolean)))
    .sort((a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b))
  const colors = Array.from(new Set<string>(product?.variants?.map((v: any) => v.color).filter(Boolean)))

  // Stock status computation
  const getAvailableQuantity = () => {
    if (!product) return 0
    if (product.variants?.length > 0) {
      const match = product.variants.find((v: any) => {
        if (selectedSize && selectedColor) return v.size === selectedSize && v.color === selectedColor
        if (selectedSize) return v.size === selectedSize
        if (selectedColor) return v.color === selectedColor
        return false
      })
      if (match) return match.quantity
      // If no variant selected yet, return the max quantity across all variants as a fallback
      return Math.max(...product.variants.map((v: any) => v.quantity), 0)
    }
    return product.quantity ?? 0
  }

  const availableQty = getAvailableQuantity()
  const isOutOfStock = availableQty <= 0
  const mediaItems = product?.media?.length
    ? product.media
    : (product?.images || []).map((image: any) => ({ ...image, type: "IMAGE", posterUrl: null }))

  const changeMedia = (direction: 1 | -1) => {
    if (!mediaItems.length) return
    setSelectedImage((current) => (current + direction + mediaItems.length) % mediaItems.length)
  }

  const handleTouchEnd = (x: number) => {
    if (touchStart === null) return
    const delta = touchStart - x
    setTouchStart(null)
    if (Math.abs(delta) < 40) return
    changeMedia(delta > 0 ? 1 : -1)
  }

  // Share handlers
  const productUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareText = product ? `Check out ${product.name} on Cavree!` : ""

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + productUrl)}`
    window.open(url, "_blank")
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
    window.open(url, "_blank")
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

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
          <div
            className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cavree-light"
            onTouchStart={(event) => setTouchStart(event.touches[0]?.clientX ?? null)}
            onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            {mediaItems[selectedImage]?.type === "VIDEO" ? (
              <video
                src={mediaItems[selectedImage]?.url}
                poster={mediaItems[selectedImage]?.posterUrl || undefined}
                controls
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={mediaItems[selectedImage]?.url || "/images/placeholder.jpg"}
                alt={mediaItems[selectedImage]?.alt || product.name}
                fill
                className="object-cover"
                priority
              />
            )}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1 md:hidden">
                {mediaItems.map((_: any, index: number) => (
                  <button
                    key={index}
                    aria-label={`Show media ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`h-1.5 rounded-full transition-all ${selectedImage === index ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                  />
                ))}
              </div>
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {mediaItems.map((item: any, idx: number) => (
                <button
                  key={item.id || `${item.url}-${idx}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === idx ? "border-cavree-primary" : "border-transparent"}`}
                >
                  {item.type === "VIDEO" ? (
                    <>
                      {item.posterUrl ? (
                        <Image src={item.posterUrl} alt={item.alt || product.name} fill className="object-cover" />
                      ) : (
                        <video src={item.url} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-0 grid place-items-center bg-black/25 text-xs font-semibold text-white">Video</span>
                    </>
                  ) : (
                    <Image src={item.url} alt={item.alt || product.name} fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-cavree-muted font-poppins">{product.category?.name}</p>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
          {product.modelNumber && (
            <p className="mt-1 text-xs uppercase tracking-wide text-cavree-muted font-poppins">Model No. {product.modelNumber}</p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {(() => {
                const avg = product.reviews?.length
                  ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
                  : 0
                const rounded = Math.round(avg)
                return [...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < rounded ? "text-cavree-accent fill-cavree-accent" : "text-gray-300"} />
                ))
              })()}
            </div>
            <span className="text-sm text-cavree-muted font-poppins">({product._count?.reviews || 0} reviews)</span>
          </div>

          <div className="mt-4">
            <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="lg" showSavedAmount />
          </div>

          {/* Stock status */}
          <div className="mt-3">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cavree-secondary">
                <AlertCircle size={16} />
                Out of Stock
              </span>
            ) : availableQty <= 5 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-cavree-secondary">
                <AlertCircle size={16} />
                Only {availableQty} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <Check size={16} />
                In Stock
              </span>
            )}
          </div>

          <p className="text-cavree-muted font-poppins text-sm leading-relaxed mt-6">
            {product.description || "No description available."}
          </p>

          {/* Size */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-montserrat font-semibold text-sm">SIZE</h3>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs text-cavree-primary hover:text-cavree-primary-light underline flex items-center gap-1"
                >
                  <Ruler size={14} />
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size: string) => {
                  const sizeQty = product.variants
                    .filter((v: any) => v.size === size)
                    .reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
                  const disabled = sizeQty <= 0
                  return (
                    <button
                      key={size}
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedSize(size === selectedSize ? null : size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors
                        ${disabled ? "border-cavree-border/50 text-cavree-muted/50 cursor-not-allowed line-through bg-cavree-light" : ""}
                        ${selectedSize === size ? "border-cavree-primary bg-cavree-primary text-white" : !disabled ? "border-cavree-border hover:border-cavree-primary" : ""}
                      `}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-montserrat font-semibold text-sm mb-3">COLOR</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((color: string) => {
                  const colorMap: Record<string, string> = {
                    black: "#000000", white: "#ffffff", red: "#ef4444", blue: "#3b82f6",
                    green: "#22c55e", yellow: "#eab308", purple: "#a855f7", pink: "#ec4899",
                    orange: "#f97316", gray: "#6b7280", brown: "#92400e", navy: "#1e3a5f",
                    beige: "#f5f5dc", cream: "#fffdd0", maroon: "#800000", teal: "#0e7b87",
                    gold: "#d4af37", silver: "#c0c0c0", olive: "#808000", coral: "#ff7f50",
                  }
                  const hex = colorMap[color.toLowerCase()] || "#ccc"
                  const isSelected = selectedColor === color
                  return (
                    <button
                      key={color}
                      title={color}
                      onClick={() => setSelectedColor(isSelected ? null : color)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${isSelected ? "border-cavree-primary scale-110" : "border-cavree-border hover:border-cavree-primary"}`}
                      style={{ backgroundColor: hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={`w-2.5 h-2.5 rounded-full ${hex.toLowerCase() === "#ffffff" || hex.toLowerCase() === "#f5f5dc" || hex.toLowerCase() === "#fffdd0" ? "bg-cavree-primary" : "bg-white"}`} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="font-montserrat font-semibold text-sm mb-3">QUANTITY</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
                className="w-10 h-10 border border-cavree-border rounded-md flex items-center justify-center hover:border-cavree-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-montserrat font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isOutOfStock}
                className="w-10 h-10 border border-cavree-border rounded-md flex items-center justify-center hover:border-cavree-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 bg-cavree-primary hover:bg-cavree-primary-light text-white py-3.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-1 bg-cavree-dark hover:bg-cavree-dark-light text-white py-3.5 rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
            <button
              onClick={toggleWishlist}
              disabled={togglingWishlist}
              className={`w-14 border rounded-md flex items-center justify-center transition-colors disabled:opacity-50
                ${inWishlist ? "border-red-300 text-red-500 bg-red-50" : "border-cavree-border hover:border-cavree-primary hover:text-cavree-primary"}
              `}
            >
              <Heart size={20} className={inWishlist ? "fill-red-500" : ""} />
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

          {/* Share buttons */}
          <div className="mt-6 pt-6 border-t border-cavree-border">
            <p className="text-xs font-medium text-cavree-muted mb-3 font-poppins">Share this product</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-cavree-border text-sm font-medium text-cavree-muted hover:border-green-500 hover:text-green-600 transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={handleFacebookShare}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-cavree-border text-sm font-medium text-cavree-muted hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                Facebook
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-cavree-border text-sm font-medium text-cavree-muted hover:border-cavree-primary hover:text-cavree-primary transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
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

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-playfair text-2xl md:text-3xl font-bold">You May Also Like</h2>
            <Link
              href={`/shop?category=${product.category?.slug}`}
              className="hidden md:flex items-center gap-1 text-sm font-medium text-cavree-primary hover:text-cavree-primary-light transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rel) => (
              <RelatedProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {relatedLoading && (
        <div className="mt-16">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}

      <RecentlyViewed />

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-cavree-muted hover:text-cavree-foreground"
            >
              <X size={20} />
            </button>
            <h3 className="font-playfair text-xl font-bold mb-4">Size Guide</h3>
            <p className="text-sm text-cavree-muted font-poppins mb-4">
              Use the chart below to find your perfect fit. Measurements are in inches.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-poppins border border-cavree-border">
                <thead>
                  <tr className="bg-cavree-light">
                    <th className="px-4 py-3 text-left font-semibold border-b border-cavree-border">Size</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-cavree-border">Chest</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-cavree-border">Waist</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-cavree-border">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { size: "XS", chest: "32-34", waist: "26-28", hip: "34-36" },
                    { size: "S", chest: "34-36", waist: "28-30", hip: "36-38" },
                    { size: "M", chest: "36-38", waist: "30-32", hip: "38-40" },
                    { size: "L", chest: "38-40", waist: "32-34", hip: "40-42" },
                    { size: "XL", chest: "40-42", waist: "34-36", hip: "42-44" },
                    { size: "XXL", chest: "42-44", waist: "36-38", hip: "44-46" },
                    { size: "3XL", chest: "44-46", waist: "38-40", hip: "46-48" },
                    { size: "4XL", chest: "46-48", waist: "40-42", hip: "48-50" },
                    { size: "5XL", chest: "48-50", waist: "42-44", hip: "50-52" },
                  ].map((row) => (
                    <tr key={row.size} className="border-b border-cavree-border last:border-b-0">
                      <td className="px-4 py-3 font-medium">{row.size}</td>
                      <td className="px-4 py-3 text-cavree-muted">{row.chest}</td>
                      <td className="px-4 py-3 text-cavree-muted">{row.waist}</td>
                      <td className="px-4 py-3 text-cavree-muted">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-cavree-muted font-poppins mt-4">
              If you are between sizes, we recommend sizing up for a more comfortable fit.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function RelatedProductCard({ product }: { product: any }) {
  const discount = getProductDiscount(product.price, product.comparePrice)
  return (
    <div className="group">
      <Link href={`/product/${product.slug}`} className="block relative overflow-hidden rounded-lg bg-cavree-light aspect-[3/4]">
        <Image
          src={product.images[0]?.url || "/images/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-cavree-primary text-white text-xs font-medium px-2.5 py-1 rounded">
            NEW
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 bg-cavree-secondary text-white text-xs font-medium px-2.5 py-1 rounded">
            {discount.label}
          </span>
        )}
      </Link>
      <div className="mt-3">
        <p className="text-xs text-cavree-muted font-poppins">{product.category?.name}</p>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-playfair text-base font-semibold mt-0.5 group-hover:text-cavree-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1">
          <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
        </div>
      </div>
    </div>
  )
}
