import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { logActivity } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAuth(["ADMIN", "SUPER_ADMIN"])
    const [retailPayments, bulkOrders] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { order: { select: { orderNumber: true, user: { select: { name: true, email: true } } } } },
      }),
      prisma.bulkOrder.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { retailer: { select: { businessName: true } } },
      }),
    ])
    const payments = [
      ...retailPayments.map((payment) => ({
        id: payment.id,
        source: "CUSTOMER",
        orderNumber: payment.order.orderNumber,
        account: payment.order.user?.name || payment.order.user?.email || "Customer",
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
      })),
      ...bulkOrders.map((order) => ({
        id: order.id,
        source: "FRANCHISE",
        orderNumber: order.orderNumber,
        account: order.retailer?.businessName || order.franchiseCode,
        method: order.paymentMethod || "PENDING",
        status: order.paymentStatus,
        amount: order.total,
        createdAt: order.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const stats = {
      total: payments.reduce((sum, payment) => sum + payment.amount, 0),
      pending: payments.filter((payment) => payment.status === "PENDING").length,
      completed: payments.filter((payment) => payment.status === "COMPLETED").length,
      failed: payments.filter((payment) => payment.status === "FAILED").length,
    }
    return NextResponse.json({ payments, stats })
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
    const id = String(body.id || "")
    const status = String(body.status || "")
    if (!id || !status) return NextResponse.json({ error: "ID and status are required" }, { status: 400 })
    if (body.source === "FRANCHISE") {
      const order = await prisma.bulkOrder.update({ where: { id }, data: { paymentStatus: status } })
      await logActivity({ userId: session.userId as string, action: "UPDATE_PAYMENT", entity: "BulkOrder", entityId: order.id, details: { status } })
      return NextResponse.json({ payment: order })
    }
    const payment = await prisma.payment.update({ where: { id }, data: { status: status as any } })
    await logActivity({ userId: session.userId as string, action: "UPDATE_PAYMENT", entity: "Payment", entityId: payment.id, details: { status } })
    return NextResponse.json({ payment })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error("Payment update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
