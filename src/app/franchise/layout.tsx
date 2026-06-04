"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { BarChart3, Boxes, ClipboardList, LogOut, PackageSearch, ShoppingCart, Store } from "lucide-react"

const portalItems = [
  { href: "/franchise/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/franchise/store", label: "Bulk Store", icon: PackageSearch },
  { href: "/franchise/cart", label: "Bulk Cart", icon: ShoppingCart },
  { href: "/franchise/orders", label: "Orders", icon: ClipboardList },
  { href: "/franchise/track", label: "Track", icon: PackageSearch },
]

function isProtectedFranchisePath(pathname: string) {
  return pathname.startsWith("/franchise/") && pathname !== "/franchise/apply" && pathname !== "/franchise/track"
}

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cavree-primary" />
      </div>
    )
  }

  if (!isProtectedFranchisePath(pathname)) {
    return <>{children}</>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="hidden md:flex w-72 shrink-0 flex-col bg-cavree-dark text-white">
        <div className="border-b border-cavree-dark-light p-6">
          <Link href="/franchise/dashboard" className="font-playfair text-xl font-bold">CAVREE</Link>
          <p className="mt-1 text-xs text-cavree-muted-light">Franchise Bulk Portal</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {portalItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${active ? "bg-cavree-primary text-white" : "text-cavree-muted-light hover:bg-cavree-dark-light hover:text-white"}`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-cavree-dark-light p-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-cavree-muted-light hover:text-white">
            <Store size={16} /> Public Store
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-cavree-border bg-white px-4 py-3 lg:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-cavree-muted">Franchise Portal</p>
              <h1 className="font-playfair text-xl font-bold">Bulk Ordering</h1>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {portalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm md:hidden ${pathname.startsWith(item.href) ? "border-cavree-primary bg-cavree-primary text-white" : "border-cavree-border bg-white"}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              <div className="hidden items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm md:flex">
                <Boxes size={16} />
                {user?.name || user?.email || "Franchise"}
              </div>
              <button onClick={logout} className="hidden items-center gap-2 rounded-md border border-cavree-border px-3 py-2 text-sm hover:bg-cavree-light md:flex">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
