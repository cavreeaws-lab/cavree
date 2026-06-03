import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { getAdminScope } from "@/lib/admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const scope = await getAdminScope(session)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    const where: any = {}
    if (status) where.status = status

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          messages: { orderBy: { createdAt: "asc" }, take: 1 },
        },
      }),
      prisma.supportTicket.count({ where }),
    ])

    return NextResponse.json({ tickets, total, page, limit })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPER_ADMIN", "FRANCHISE_STAFF"])
    const body = await request.json()
    const { ticketId, message, status } = body

    if (!ticketId || !message) {
      return NextResponse.json({ error: "ticketId and message required" }, { status: 400 })
    }

    const senderType = session.role === "FRANCHISE_STAFF" ? "ADMIN" : (session.role as string)

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        message,
        senderType,
        attachments: body.attachments || [],
      },
    })

    if (status) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status },
      })
    }

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
