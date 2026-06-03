"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Instagram, Facebook, Twitter } from "lucide-react"

export function Footer() {
  const pathname = usePathname()
  const isAdminSurface =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin") ||
    (pathname.startsWith("/franchise/") && pathname !== "/franchise/apply") ||
    pathname.startsWith("/sales")

  if (isAdminSurface) return null

  return (
    <footer className="bg-cavree-dark text-white">
      {/* Newsletter */}
      <div className="border-b border-cavree-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-playfair text-2xl font-bold">Stay in the loop</h3>
              <p className="text-cavree-muted-light mt-1 text-sm font-poppins">
                Subscribe for exclusive offers and updates
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 bg-cavree-dark-light border border-cavree-dark-light rounded-md text-sm outline-none focus:border-cavree-primary-light transition-colors"
              />
              <button className="px-6 py-3 bg-cavree-primary hover:bg-cavree-primary-light text-white font-medium text-sm rounded-md transition-colors whitespace-nowrap">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="font-playfair text-lg font-bold mb-4">CAVREE</h4>
            <p className="text-cavree-muted-light text-sm leading-relaxed font-poppins">
              Luxury fashion for the modern individual. Curated collections from top franchises across India.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-cavree-primary-light transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-cavree-primary-light transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-cavree-primary-light transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-montserrat font-semibold text-sm mb-4 tracking-wide">SHOP</h4>
            <ul className="space-y-2.5 text-sm text-cavree-muted-light font-poppins">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=women" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link href="/shop?category=men" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link href="/shop?isNew=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-montserrat font-semibold text-sm mb-4 tracking-wide">COMPANY</h4>
            <ul className="space-y-2.5 text-sm text-cavree-muted-light font-poppins">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/franchise" className="hover:text-white transition-colors">Franchise</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-montserrat font-semibold text-sm mb-4 tracking-wide">HELP</h4>
            <ul className="space-y-2.5 text-sm text-cavree-muted-light font-poppins">
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-cavree-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-cavree-muted-light font-poppins">
            &copy; 2024 Cavree. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-cavree-muted-light font-poppins">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
