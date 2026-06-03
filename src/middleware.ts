import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

function getEncodedKey() {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET environment variable is required")
  }
  return new TextEncoder().encode(secret)
}

function getMainDomain(): string {
  return process.env.MAIN_DOMAIN || "cavree.com"
}

function getSubdomain(host: string): string | null {
  const mainDomain = getMainDomain()
  if (host === mainDomain || host === `www.${mainDomain}`) return null
  const parts = host.split(".")
  if (parts.length >= 3 && host.endsWith(`.${mainDomain}`)) {
    return parts[0]
  }
  return null
}

function normalizePortalPath(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "/admin/dashboard"
  if (pathname === "/super-admin" || pathname === "/super-admin/") return "/super-admin/dashboard"
  if (pathname === "/franchise/" || pathname === "/franchise/dashboard/") return "/franchise/dashboard"
  if (pathname === "/sales" || pathname === "/sales/") return "/sales/dashboard"
  return pathname
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host") || ""
  const mainDomain = getMainDomain()

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    /\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot|gif|webp)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const subdomain = getSubdomain(host)
  const sessionCookie = request.cookies.get("session")?.value
  const isApiRoute = pathname.startsWith("/api")
  const isAuthRoute = pathname.startsWith("/auth") || pathname.startsWith("/api/auth")

  const getSession = async () => {
    if (!sessionCookie) return null
    try {
      const { payload } = await jwtVerify(sessionCookie, getEncodedKey(), { clockTolerance: 60 })
      return payload
    } catch {
      return null
    }
  }

  const session = await getSession()
  const role = session?.role as string | undefined

  const loginUrl = new URL("/auth/login", `https://${mainDomain}`)
  const homeUrl = new URL("/", `https://${mainDomain}`)
  const normalizedPathname = normalizePortalPath(pathname)
  const normalizedPathWithSearch = `${normalizedPathname}${request.nextUrl.search}`
  const currentUrl = new URL(normalizedPathWithSearch, `https://${host || mainDomain}`)

  const requireAuth = (allowedRoles: string[]) => {
    if (!session) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      loginUrl.searchParams.set("redirect", currentUrl.toString())
      return NextResponse.redirect(loginUrl)
    }
    if (!allowedRoles.includes(role!)) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      return NextResponse.redirect(homeUrl)
    }
    return null
  }

  // ========== MAIN DOMAIN ==========
  if (!subdomain) {
    const isAdminRoute = pathname.startsWith("/admin")
    const isSuperAdminRoute = pathname.startsWith("/super-admin")
    const isFranchisePortalRoute = pathname.startsWith("/franchise/") && pathname !== "/franchise/apply" && pathname !== "/franchise/track"
    const isSalesRoute = pathname.startsWith("/sales")
    const isAccountRoute = pathname.startsWith("/account")

    if (!isAdminRoute && !isSuperAdminRoute && !isFranchisePortalRoute && !isSalesRoute && !isAccountRoute) {
      return NextResponse.next()
    }

    if (!session) {
      const localLoginUrl = new URL("/auth/login", request.url)
      localLoginUrl.searchParams.set("redirect", normalizedPathWithSearch)
      return NextResponse.redirect(localLoginUrl)
    }

    if (normalizedPathname !== pathname) {
      return NextResponse.redirect(new URL(normalizedPathWithSearch, request.url))
    }

    if (isSuperAdminRoute && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isAdminRoute && !["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"].includes(role!)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isFranchisePortalRoute && !["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"].includes(role!)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isSalesRoute && !["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"].includes(role!)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  // ========== SUBDOMAINS ==========
  if (subdomain && isAuthRoute) {
    return NextResponse.next()
  }

  if (subdomain === "franchise") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/franchise/dashboard", request.url))
    }
    if (pathname === "/franchise/apply" || pathname === "/franchise/track") {
      return NextResponse.next()
    }
    if (pathname === "/") {
      if (session && ["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"].includes(role!)) {
        return NextResponse.redirect(new URL("/franchise/dashboard", request.url))
      }
      loginUrl.searchParams.set("redirect", `https://${host}/franchise/dashboard`)
      return NextResponse.redirect(loginUrl)
    }
    if (normalizedPathname !== pathname && session && ["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"].includes(role!)) {
      return NextResponse.redirect(new URL(normalizedPathWithSearch, request.url))
    }
    const result = requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    if (result) return result
    return NextResponse.next()
  }

  if (subdomain === "sales") {
    if (pathname === "/") {
      if (session && ["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"].includes(role!)) {
        return NextResponse.redirect(new URL("/sales/dashboard", request.url))
      }
      loginUrl.searchParams.set("redirect", `https://${host}/sales/dashboard`)
      return NextResponse.redirect(loginUrl)
    }
    if (normalizedPathname !== pathname && session && ["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"].includes(role!)) {
      return NextResponse.redirect(new URL(normalizedPathWithSearch, request.url))
    }
    const result = requireAuth(["SALES_EXECUTIVE", "ADMIN", "SUPER_ADMIN"])
    if (result) return result
    return NextResponse.next()
  }

  if (subdomain === "admin") {
    if (pathname === "/") {
      if (session && ["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"].includes(role!)) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url))
      }
      loginUrl.searchParams.set("redirect", `https://${host}/admin/dashboard`)
      return NextResponse.redirect(loginUrl)
    }
    if (normalizedPathname !== pathname && session && ["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"].includes(role!)) {
      return NextResponse.redirect(new URL(normalizedPathWithSearch, request.url))
    }
    const result = requireAuth(["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    if (result) return result
    return NextResponse.next()
  }

  if (subdomain === "super-admin") {
    if (pathname === "/") {
      if (role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/super-admin/dashboard", request.url))
      }
      loginUrl.searchParams.set("redirect", `https://${host}/super-admin/dashboard`)
      return NextResponse.redirect(loginUrl)
    }
    if (normalizedPathname !== pathname && session && role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL(normalizedPathWithSearch, request.url))
    }
    const result = requireAuth(["SUPER_ADMIN"])
    if (result) return result
    return NextResponse.next()
  }

  // Unknown subdomain
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
