import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const userId = session.userId as string
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: params.id, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ ticket })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth()
    const userId = session.userId as string
    const body = await request.json()

    const ticket = await prisma.supportTicket.findFirst({
      where: { id: params.id, userId },
    })
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: params.id,
        message: body.message,
        senderType: "CUSTOMER",
        attachments: body.attachments || [],
      },
    })

    await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: "OPEN" },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
