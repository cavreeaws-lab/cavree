import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { csvResponse, toCsv } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["SUPER_ADMIN"])
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const franchiseId = searchParams.get("franchiseId")
    const paymentMethod = searchParams.get("paymentMethod")
    const exportFormat = searchParams.get("export")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const where: any = {}
    if (status) where.status = status
    if (franchiseId) where.franchiseId = franchiseId
    if (paymentMethod) where.payment = { is: { method: paymentMethod } }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { franchise: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: { select: { name: true, images: true } } } },
        user: { select: { name: true, email: true } },
        franchise: { select: { name: true } },
        address: true,
        payment: true,
        shippingDetail: true,
      },
      skip: exportFormat === "csv" ? undefined : (page - 1) * limit,
      take: exportFormat === "csv" ? undefined : limit,
    })
    const total = await prisma.order.count({ where })

    if (exportFormat === "csv") {
      return csvResponse(
        "super-admin-orders.csv",
        toCsv(
          orders.map((order) => ({
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

    return NextResponse.json({ orders, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
