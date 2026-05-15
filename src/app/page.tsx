"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { ArrowRight, ShoppingBag, Star, Truck, Shield, Headphones } from "lucide-react"
import toast from "react-hot-toast"

const heroSlides = [
  {
    title: "Elevate Your Style",
    subtitle: "Discover the Latest Luxury Fashion Collections",
    cta: "Shop Now",
    image: "/images/hero-1.jpg",
  },
  {
    title: "Timeless Elegance",
    subtitle: "Premium Dresses for Every Occasion",
    cta: "Explore",
    image: "/images/hero-2.jpg",
  },
  {
    title: "New Arrivals",
    subtitle: "Be the First to Own the Season's Best",
    cta: "View Collection",
    image: "/images/hero-3.jpg",
  },
]

const categories = [
  { name: "Women", image: "/images/cat-women.jpg", count: 120 },
  { name: "Men", image: "/images/cat-men.jpg", count: 85 },
  { name: "Accessories", image: "/images/cat-accessories.jpg", count: 45 },
  { name: "Footwear", image: "/images/cat-footwear.jpg", count: 60 },
]

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹5000" },
  { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team" },
  { icon: Star, title: "Premium Quality", desc: "Curated luxury items" },
]

function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0]?.url || "/images/placeholder.jpg",
    })
    toast.success("Added to cart!")
  }

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
        {product.comparePrice && (
          <span className="absolute top-3 right-3 bg-cavree-secondary text-white text-xs font-medium px-2.5 py-1 rounded">
            SALE
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
        <div className="flex items-center gap-2 mt-1">
          <span className="font-montserrat font-semibold text-sm">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-cavree-muted-light line-through">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.comparePrice)}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full py-2 border border-cavree-primary text-cavree-primary text-sm font-medium rounded-md hover:bg-cavree-primary hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch("/api/products?limit=8")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error)

    fetch("/api/products?limit=4&isFeatured=true")
      .then((res) => res.json())
      .then((data) => setFeaturedProducts(data.products || []))
      .catch(console.error)
  }, [])

  return (
    <div>
      {/* Hero Slider */}
      <section className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 z-10" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="relative z-20 h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-xl animate-slide-up">
                <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {slide.title}
                </h1>
                <p className="mt-4 text-lg md:text-xl text-white/90 font-poppins">
                  {slide.subtitle}
                </p>
                <Link
                  href="/shop"
                  className="mt-8 inline-flex items-center gap-2 bg-cavree-primary hover:bg-cavree-primary-light text-white px-8 py-3.5 rounded-md font-medium transition-colors"
                >
                  {slide.cta}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-cavree-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cavree-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={22} className="text-cavree-primary" />
                </div>
                <div>
                  <h4 className="font-montserrat font-semibold text-sm">{feature.title}</h4>
                  <p className="text-xs text-cavree-muted font-poppins mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold">Shop by Category</h2>
            <p className="text-cavree-muted mt-2 font-poppins">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/shop?category=${category.name.toLowerCase()}`}
                className="group relative aspect-[4/5] rounded-lg overflow-hidden"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="font-playfair text-xl md:text-2xl font-bold">{category.name}</h3>
                  <p className="text-sm mt-1 font-poppins">{category.count} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-cavree-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold">Featured Collection</h2>
              <p className="text-cavree-muted mt-2 font-poppins">Handpicked luxury items for you</p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-1 text-sm font-medium text-cavree-primary hover:text-cavree-primary-light transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-sm font-medium text-cavree-primary"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold">New Arrivals</h2>
              <p className="text-cavree-muted mt-2 font-poppins">Fresh drops from top franchises</p>
            </div>
            <Link
              href="/shop?isNew=true"
              className="hidden md:flex items-center gap-1 text-sm font-medium text-cavree-primary hover:text-cavree-primary-light transition-colors"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Franchise CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-cavree-primary/95" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            Become a Cavree Franchise
          </h2>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto font-poppins">
            Join our network of luxury fashion franchises. Get access to premium products, marketing support, and grow your business with us.
          </p>
          <Link
            href="/franchise"
            className="mt-8 inline-flex items-center gap-2 bg-white text-cavree-primary hover:bg-cavree-light px-8 py-3.5 rounded-md font-medium transition-colors"
          >
            Apply Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
