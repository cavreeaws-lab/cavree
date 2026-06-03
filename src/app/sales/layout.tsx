"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { BadgeIndianRupee, ClipboardList, LayoutDashboard, LogOut, PackageSearch, Store, Users } from "lucide-react"

const items = [
  { href: "/sales/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales/retailers", label: "My Retailers", icon: Users },
  { href: "/sales/orders", label: "Orders", icon: ClipboardList },
  { href: "/sales/payments", label: "Payments", icon: BadgeIndianRupee },
  { href: "/sales/catalog", label: "Catalog", icon: PackageSearch },
]

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="hidden w-72 shrink-0 flex-col bg-cavree-dark text-white md:flex">
        <div className="border-b border-cavree-dark-light p-6">
          <Link href="/sales/dashboard" className="font-playfair text-xl font-bold">CAVREE</Link>
          <p className="mt-1 text-xs text-cavree-muted-light">Sales Executive Portal</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {items.map((item) => {
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
              <p className="text-xs uppercase tracking-wider text-cavree-muted">Sales Portal</p>
              <h1 className="font-playfair text-xl font-bold">Retailer Operations</h1>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm md:hidden ${pathname.startsWith(item.href) ? "border-cavree-primary bg-cavree-primary text-white" : "border-cavree-border bg-white"}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
              <span className="hidden rounded-md border border-cavree-border px-3 py-2 text-sm md:inline-flex">
                {user?.name || user?.email || "Sales Executive"}
              </span>
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
