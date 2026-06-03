import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { generateInvoiceNumber } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()
    const order = await prisma.order.findFirst({
      where: {
        userId: session.userId as string,
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        items: true,
        address: true,
        payment: true,
        invoices: true,
      },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const invoice = order.invoices[0] || await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: generateInvoiceNumber(order.orderNumber),
      },
    })

    return NextResponse.json({ invoice, order })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
