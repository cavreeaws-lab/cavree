"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Heart, User, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/useCart"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Account", icon: User },
]

const HIDDEN_PATHS = ["/admin", "/super-admin", "/auth"]

export function MobileNav() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()

  const isHidden = HIDDEN_PATHS.some((p) => pathname.startsWith(p))
  if (isHidden) return null

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-cavree-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors ${
                active ? "text-cavree-primary" : "text-cavree-muted"
              }`}
            >
              <div className="relative">
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                {item.href === "/cart" && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-cavree-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-poppins ${active ? "font-medium" : ""}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
