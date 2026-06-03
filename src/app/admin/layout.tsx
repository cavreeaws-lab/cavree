"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Package,
  Store,
  Users,
  UserRoundCog,
  Tags,
  Warehouse,
  Ticket,
  FileText,
  Settings,
  BarChart3,
  ChevronLeft,
  MessageCircle,
  Wallet,
  Percent,
  ChevronDown,
  Bell,
  Search,
  UserCircle,
  LogOut,
  Shield,
  Truck,
  Newspaper,
} from "lucide-react"

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/bulk-orders", label: "Bulk Orders", icon: ClipboardList },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/retailers", label: "Retailers", icon: Store },
      { href: "/admin/sales-executives", label: "Sales Executives", icon: UserRoundCog },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/wallet", label: "Wallet", icon: Wallet },
      { href: "/admin/payments", label: "Payments", icon: Wallet },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/bulk-products", label: "Bulk Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tags },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { href: "/admin/warehouses", label: "Warehouses", icon: Warehouse },
      { href: "/admin/reviews", label: "Reviews", icon: MessageCircle },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/staff", label: "Staff", icon: Shield },
      { href: "/admin/tickets", label: "Support Tickets", icon: Ticket },
      { href: "/admin/shipping", label: "Shipping", icon: Truck },
      { href: "/admin/content", label: "Content", icon: FileText },
      { href: "/admin/blog/posts", label: "Blog Posts", icon: Newspaper },
      { href: "/admin/blog/categories", label: "Blog Categories", icon: Newspaper },
      { href: "/admin/commissions", label: "Commissions", icon: Percent },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const navItems = navGroups.flatMap((group) => group.items)
  const currentItem = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
  const isFranchiseUser = user?.role === "FRANCHISEE"
  const portalLabel = isFranchiseUser ? "Franchise Admin" : user?.role === "SUPER_ADMIN" ? "Super Admin" : "Cavree Admin"
  const breadcrumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean).slice(1)
    return [portalLabel, ...parts.map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))]
  }, [pathname, portalLabel])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-cavree-dark text-white flex-shrink-0 flex-col">
        <div className="p-6 border-b border-cavree-dark-light">
          <Link href="/" className="font-playfair text-xl font-bold">
            CAVREE
          </Link>
          <p className="text-xs text-cavree-muted-light mt-1 font-poppins">{portalLabel}</p>
        </div>

        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {navGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.label]
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setCollapsedGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wider text-cavree-muted-light hover:text-white"
                >
                  {group.label}
                  <ChevronDown size={14} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-cavree-primary text-white" : "text-cavree-muted-light hover:text-white hover:bg-cavree-dark-light"}`}
                        >
                          <item.icon size={18} />
                          {item.label}
                          {item.label === "Orders" && <span className="ml-auto rounded-full bg-cavree-secondary px-2 py-0.5 text-[10px] text-white">Live</span>}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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
              {currentItem?.label || "Admin"}
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
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cavree-muted" />
              <input
                placeholder="Search admin..."
                className="w-64 rounded-md border border-cavree-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-cavree-primary"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    const value = event.currentTarget.value.trim()
                    if (value) window.location.href = `/admin/orders?search=${encodeURIComponent(value)}`
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
                  <p className="font-montserrat text-sm font-semibold">Notifications</p>
                  <div className="mt-3 space-y-2 text-sm font-poppins">
                    <p className="rounded-md bg-cavree-light p-2">Review pending approvals and low-stock items.</p>
                    <p className="rounded-md bg-cavree-light p-2">Use exports from list pages for offline reports.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowProfile((value) => !value)} className="flex items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm font-poppins hover:bg-cavree-light">
                <UserCircle size={18} />
                {portalLabel}
              </button>
              {showProfile && (
                <div className="absolute right-0 top-11 z-20 w-48 rounded-lg border border-cavree-border bg-white p-2 shadow-lg">
                  <Link href="/admin/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-cavree-light">Settings</Link>
                  <Link href="/" className="block rounded-md px-3 py-2 text-sm hover:bg-cavree-light">Storefront</Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
        <footer className="border-t border-cavree-border bg-white px-4 py-3 text-xs text-cavree-muted font-poppins lg:px-6">
          Cavree Admin v1.0 · Operational dashboard
        </footer>
      </div>
    </div>
  )
}
