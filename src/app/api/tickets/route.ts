import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.userId as string
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const where: any = { userId }
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
      }),
      prisma.supportTicket.count({ where }),
    ])

    return NextResponse.json({ tickets, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const userId = session.userId as string
    const body = await request.json()

    const hasOrder = await prisma.order.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (!hasOrder) {
      return NextResponse.json(
        { error: "You must have placed an order to create a support ticket" },
        { status: 403 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        subject: body.subject,
        description: body.description || null,
        category: body.category || null,
        priority: body.priority || "MEDIUM",
        userId,
        orderId: body.orderId || null,
        messages: {
          create: {
            message: body.description || body.subject,
            senderType: "CUSTOMER",
          },
        },
      },
      include: { messages: true },
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
