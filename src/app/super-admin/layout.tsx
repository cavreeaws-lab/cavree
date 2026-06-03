"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  Shield,
  ClipboardList,
  Bell,
  Search,
  UserCircle,
  RotateCcw,
  ScrollText,
  MessageCircle,
} from "lucide-react"

const navItems = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/franchise-applications", label: "Applications", icon: ClipboardList },
  { href: "/super-admin/franchises", label: "Franchises", icon: Store },
  { href: "/super-admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/super-admin/products", label: "Products", icon: Package },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/super-admin/content", label: "Content", icon: FileText },
  { href: "/super-admin/returns", label: "Return Arbitration", icon: RotateCcw },
  { href: "/super-admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
  { href: "/super-admin/settings/reviews", label: "Review Settings", icon: MessageCircle },
]

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const currentItem = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const breadcrumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean).slice(1)
    return ["Super Admin", ...parts.map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))]
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-cavree-dark text-white flex-shrink-0 flex-col">
        <div className="p-6 border-b border-cavree-dark-light">
          <Link href="/" className="font-playfair text-xl font-bold">
            CAVREE
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Shield size={14} className="text-cavree-primary-light" />
            <p className="text-xs text-cavree-muted-light font-poppins">Super Admin</p>
          </div>
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
        <header className="bg-white border-b border-cavree-border min-h-16 flex flex-col gap-3 px-4 py-3 lg:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="font-playfair text-lg font-bold">
              {currentItem?.label || "Super Admin"}
            </h1>
            <div className="mt-1 flex items-center gap-1 text-xs text-cavree-muted font-poppins">
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb}-${index}`} className="flex items-center gap-1">
                  {index > 0 && <span>/</span>}
                  <span className={index === breadcrumbs.length - 1 ? "text-cavree-foreground" : ""}>{crumb}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
              <input
                placeholder="Search platform..."
                className="w-64 rounded-md border border-cavree-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-cavree-primary"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const value = event.currentTarget.value.trim()
                    if (value) window.location.href = `/super-admin/users?search=${encodeURIComponent(value)}`
                  }
                }}
              />
            </div>
            <div className="relative">
              <button onClick={() => setShowNotifications((value) => !value)} className="relative rounded-md border border-cavree-border p-2 hover:bg-cavree-light">
                <Bell size={18} />
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cavree-secondary" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-11 z-20 w-72 rounded-lg border border-cavree-border bg-white p-3 shadow-lg">
                  <p className="font-montserrat text-sm font-semibold">Platform Alerts</p>
                  <div className="mt-3 space-y-2 text-sm font-poppins">
                    <p className="rounded-md bg-cavree-light p-2">Review franchise applications and pending payouts.</p>
                    <p className="rounded-md bg-cavree-light p-2">Use analytics to track marketplace growth.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm font-poppins">
              <UserCircle size={18} />
              Super Administrator
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
        <footer className="border-t border-cavree-border bg-white px-4 py-3 text-xs text-cavree-muted font-poppins lg:px-6">
          Cavree Super Admin v1.0 · Marketplace operations
        </footer>
      </div>
    </div>
  )
}
