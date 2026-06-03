import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { csvResponse, getAdminScope, toCsv } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    if (scope.isFranchiseScoped && !scope.franchiseId) {
      return NextResponse.json({ error: "No franchise found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const paymentMethod = searchParams.get("paymentMethod")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const exportType = searchParams.get("export")

    const where: any = scope.franchiseId ? { franchiseId: scope.franchiseId } : {}
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }
    if (paymentMethod) where.payment = { is: { method: paymentMethod } }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (exportType === "csv") {
      const rows = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          payment: true,
          franchise: { select: { name: true } },
        },
      })
      return csvResponse(
        "orders.csv",
        toCsv(
          rows.map((order: any) => ({
            orderNumber: order.orderNumber,
            customer: order.user?.name || "",
            email: order.user?.email || "",
            franchise: order.franchise?.name || "",
            status: order.status,
            paymentMethod: order.payment?.method || "",
            paymentStatus: order.payment?.status || "",
            total: order.total,
            createdAt: order.createdAt.toISOString(),
          })),
          [
            { key: "orderNumber", label: "Order Number" },
            { key: "customer", label: "Customer" },
            { key: "email", label: "Email" },
            { key: "franchise", label: "Franchise" },
            { key: "status", label: "Status" },
            { key: "paymentMethod", label: "Payment Method" },
            { key: "paymentStatus", label: "Payment Status" },
            { key: "total", label: "Total" },
            { key: "createdAt", label: "Created At" },
          ]
        )
      )
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
          payment: true,
          address: true,
          franchise: { select: { name: true, commission: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({ orders, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
