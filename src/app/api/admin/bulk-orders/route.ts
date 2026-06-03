import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope, logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

const orderStatuses = new Set(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED", "REFUNDED"])
const paymentStatuses = new Set(["PENDING", "COMPLETED", "FAILED", "REFUNDED"])

function csvCell(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["FRANCHISEE", "ADMIN", "SUPER_ADMIN"])
    const scope = await getAdminScope(session)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const paymentStatus = searchParams.get("paymentStatus")
    const exportMode = searchParams.get("export")

    const where: any = {}
    if (scope.franchiseId) where.retailer = { franchiseId: scope.franchiseId }
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { franchiseCode: { contains: search, mode: "insensitive" } },
        { deliveryName: { contains: search, mode: "insensitive" } },
        { retailer: { businessName: { contains: search, mode: "insensitive" } } },
      ]
    }

    const orders = await prisma.bulkOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        retailer: { select: { businessName: true, ownerName: true, salesExecutive: { select: { name: true } } } },
        items: true,
        timeline: { orderBy: { createdAt: "asc" } },
      },
    })

    if (exportMode === "csv") {
      const rows = [
        ["Order", "Franchise", "Retailer", "Units", "Pieces", "Payment", "Status", "Total", "Created"].map(csvCell).join(","),
        ...orders.map((order) => [
          order.orderNumber,
          order.franchiseCode,
          order.retailer?.businessName || "",
          order.totalUnits,
          order.totalPieces,
          order.paymentStatus,
          order.status,
          order.total,
          order.createdAt.toISOString(),
        ].map(csvCell).join(",")),
      ].join("\n")
      return new NextResponse(rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bulk-orders.csv"`,
        },
      })
    }

    const stats = {
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      revenue: orders.reduce((sum, order) => sum + order.total, 0),
      units: orders.reduce((sum, order) => sum + order.totalUnits, 0),
    }

    return NextResponse.json({ orders, stats })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const body = await request.json()
    const orderId = String(body.orderId || "")
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    if (body.status && !orderStatuses.has(body.status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
    }
    if (body.paymentStatus && !paymentStatuses.has(body.paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
    }

    const order = await prisma.bulkOrder.update({
      where: { id: orderId },
      data: {
        status: body.status || undefined,
        paymentStatus: body.paymentStatus || undefined,
        timeline: body.status
          ? {
              create: {
                status: body.status,
                title: `Order marked ${String(body.status).replace(/_/g, " ").toLowerCase()}`,
                note: body.note || null,
              },
            }
          : undefined,
      },
      include: { timeline: true },
    })

    await logActivity({
      userId: session.userId as string,
      action: "UPDATE_BULK_ORDER",
      entity: "BulkOrder",
      entityId: order.id,
      details: { status: body.status, paymentStatus: body.paymentStatus },
    })

    return NextResponse.json({ order })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Bulk order update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
