"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Tags,
  Warehouse,
  Ticket,
  FileText,
  Settings,
  BarChart3,
  ChevronLeft,
  MessageCircle,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: MessageCircle },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-cavree-dark text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-cavree-dark-light">
          <Link href="/" className="font-playfair text-xl font-bold">
            CAVREE
          </Link>
          <p className="text-xs text-cavree-muted-light mt-1 font-poppins">Franchise Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-cavree-primary text-white" : "text-cavree-muted-light hover:text-white hover:bg-cavree-dark-light"}`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-cavree-dark-light">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-cavree-muted-light hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-cavree-border h-16 flex items-center justify-between px-6">
          <h1 className="font-playfair text-lg font-bold">
            {navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label || "Admin"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-cavree-muted font-poppins">Franchise Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
