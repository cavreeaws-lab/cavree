"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/hooks/useAuth"
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { getTotalItems } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = mounted ? getTotalItems() : 0
  const isPortalSurface =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin") ||
    (pathname.startsWith("/franchise/") && pathname !== "/franchise/apply") ||
    pathname.startsWith("/sales")

  if (isPortalSurface) return null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-cavree-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="font-playfair text-2xl lg:text-3xl font-bold text-cavree-primary tracking-tight">
              CAVREE
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              HOME
            </Link>
            <Link href="/shop" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              SHOP
            </Link>
            <Link href="/stores" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              STORES
            </Link>
            <Link href="/franchise" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              FRANCHISE
            </Link>
            <Link href="/blog" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              BLOG
            </Link>
            <Link href="/about" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              ABOUT
            </Link>
            <Link href="/contact" className="text-sm font-montserrat font-medium text-cavree-foreground hover:text-cavree-primary transition-colors">
              CONTACT
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-cavree-primary transition-colors"
            >
              <Search size={20} />
            </button>

            <Link href="/account/wishlist" className="p-2 hover:text-cavree-primary transition-colors hidden sm:block">
              <Heart size={20} />
            </Link>

            <Link href="/cart" className="p-2 hover:text-cavree-primary transition-colors relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cavree-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="p-2 hover:text-cavree-primary transition-colors flex items-center gap-1">
                  <User size={20} />
                  <ChevronDown size={14} className="hidden sm:block" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cavree-border shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                  <Link href="/account/profile" className="block px-4 py-2 text-sm hover:bg-cavree-light transition-colors">
                    My Profile
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-cavree-light transition-colors">
                    My Orders
                  </Link>
                  <Link href="/account/tickets" className="block px-4 py-2 text-sm hover:bg-cavree-light transition-colors">
                    My Tickets
                  </Link>
                  {user.role === "FRANCHISEE" && (
                    <Link href="/franchise/dashboard" className="block px-4 py-2 text-sm hover:bg-cavree-light transition-colors">
                      Franchise Portal
                    </Link>
                  )}
                  {user.role === "SALES_EXECUTIVE" && (
                    <Link href="/sales/dashboard" className="block px-4 py-2 text-sm hover:bg-cavree-light transition-colors">
                      Sales Portal
                    </Link>
                  )}
                  {user.role === "SUPER_ADMIN" && (
                    <Link href="/super-admin/dashboard" className="block px-4 py-2 text-sm hover:bg-cavree-light transition-colors">
                      Super Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-cavree-light transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="p-2 hover:text-cavree-primary transition-colors">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 border-t border-cavree-border">
            <form onSubmit={handleSearch} className="flex items-center py-3">
              <Search size={18} className="text-cavree-muted mr-3" />
              <input
                type="text"
                placeholder="Search for products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-poppins"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-cavree-muted hover:text-cavree-foreground">
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-cavree-border">
          <nav className="px-4 py-3 space-y-1">
            <Link href="/" className="block py-3 text-sm font-medium border-b border-cavree-border" onClick={() => setMobileMenuOpen(false)}>
              HOME
            </Link>
            <Link href="/shop" className="block py-3 text-sm font-medium border-b border-cavree-border" onClick={() => setMobileMenuOpen(false)}>
              SHOP
            </Link>
            <Link href="/stores" className="block py-3 text-sm font-medium border-b border-cavree-border" onClick={() => setMobileMenuOpen(false)}>
              STORES
            </Link>
            <Link href="/franchise" className="block py-3 text-sm font-medium border-b border-cavree-border" onClick={() => setMobileMenuOpen(false)}>
              FRANCHISE
            </Link>
            <Link href="/blog" className="block py-3 text-sm font-medium border-b border-cavree-border" onClick={() => setMobileMenuOpen(false)}>
              BLOG
            </Link>
            <Link href="/about" className="block py-3 text-sm font-medium border-b border-cavree-border" onClick={() => setMobileMenuOpen(false)}>
              ABOUT
            </Link>
            <Link href="/contact" className="block py-3 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              CONTACT
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
