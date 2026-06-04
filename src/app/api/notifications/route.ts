import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await requireAuth()
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId as string },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    const unreadCount = await prisma.notification.count({
      where: { userId: session.userId as string, isRead: false },
    })
    return NextResponse.json({ notifications, unreadCount })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { ids, markAllRead } = body

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.userId as string, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ message: "All notifications marked as read" })
    }

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: session.userId as string },
        data: { isRead: true },
      })
      return NextResponse.json({ message: "Notifications marked as read" })
    }

    return NextResponse.json({ error: "No notification IDs provided" }, { status: 400 })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      await prisma.notification.deleteMany({
        where: { id, userId: session.userId as string },
      })
      return NextResponse.json({ message: "Notification deleted" })
    }

    await prisma.notification.deleteMany({
      where: { userId: session.userId as string },
    })
    return NextResponse.json({ message: "All notifications cleared" })
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
